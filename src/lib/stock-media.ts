export type MediaType = "photo" | "vector" | "illustration";
export type StockPhoto = {
  id: string | number;
  photographer: string;
  photographer_url: string;
  url: string;
  alt: string;
  type: MediaType;
  src: { original: string; large: string; medium: string; small: string; tiny: string };
};
type SearchResult = {
  photos: StockPhoto[];
  page: number;
  per_page: number;
  total_results: number;
  next_page: number | null;
};
type PixabayHit = {
  id: string | number;
  user?: string;
  pageURL?: string;
  tags?: string;
  type?: string;
  largeImageURL?: string;
  webformatURL?: string;
  previewURL?: string;
};
const cache = new Map<string, { expires: number; result: SearchResult }>();

export function isMediaType(value: unknown): value is MediaType {
  return value === "photo" || value === "vector" || value === "illustration";
}

function pixabayCdnVariant(url: string, size: 640 | 1280): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "cdn.pixabay.com" || parsed.port) return null;
    const match = parsed.pathname.match(/^(.*)_\d+(\.[a-z0-9]+)$/i);
    if (!match) return null;
    parsed.pathname = `${match[1]}_${size}${match[2]}`;
    return parsed.toString();
  } catch {
    return null;
  }
}

function normalizePixabayPhoto(photo: StockPhoto): StockPhoto {
  const preview = photo.src.tiny || photo.src.small || photo.src.medium;
  const large = pixabayCdnVariant(preview, 1280);
  const medium = pixabayCdnVariant(preview, 640);
  if (!large || !medium) return photo;
  return {
    ...photo,
    src: { ...photo.src, original: large, large: medium, medium, small: medium, tiny: preview },
  };
}

/** Shared stock search. A vector/illustration request must never fall back to photos. */
export async function searchStockMedia(
  query: string,
  imageType: MediaType | "all" = "all",
  perPage = 6,
  page = 1,
): Promise<SearchResult> {
  query = query.trim().slice(0, 100);
  perPage = Math.min(Math.max(perPage, 3), 40);
  page = Math.min(Math.max(page, 1), 50);
  const cacheKey = JSON.stringify([query, imageType, perPage, page]);
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.result;
  const empty: SearchResult = {
    photos: [],
    page,
    per_page: perPage,
    total_results: 0,
    next_page: null,
  };
  if (!query) return empty;
  const remember = (result: SearchResult) => {
    for (const [key, entry] of cache) if (entry.expires <= Date.now()) cache.delete(key);
    if (cache.size >= 200) cache.delete(cache.keys().next().value!);
    cache.set(cacheKey, { result, expires: Date.now() + 86400000 });
    return result;
  };
  const pixabayKey = process.env["PIXABAY_API_KEY"] || "58123311-8a89c5e2df18a2650add733fa";
  try {
    const params = new URLSearchParams({
      key: pixabayKey,
      q: query,
      image_type: imageType,
      safesearch: "true",
      per_page: String(perPage),
      page: String(page),
    });
    const res = await fetch(`https://pixabay.com/api/?${params}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data: { hits?: PixabayHit[]; totalHits?: number } = await res.json();
      const hits = Array.isArray(data.hits) ? data.hits : [];
      const photos: StockPhoto[] = hits
        .filter((hit) => imageType === "all" || hit.type === imageType)
        .map((hit) => ({
          id: hit.id,
          photographer: hit.user || "Pixabay Artist",
          photographer_url: hit.pageURL || "",
          url: hit.pageURL || "",
          alt: hit.tags || query,
          type: isMediaType(hit.type) ? hit.type : "photo",
          src: {
            original: hit.largeImageURL || hit.webformatURL || hit.previewURL || "",
            large: hit.webformatURL || hit.previewURL || "",
            medium: hit.webformatURL || hit.previewURL || "",
            small: hit.previewURL || hit.webformatURL || "",
            tiny: hit.previewURL || hit.webformatURL || "",
          },
        })).map(normalizePixabayPhoto);
      if (photos.length || imageType === "vector" || imageType === "illustration") {
        const total = Number(data.totalHits) || photos.length;
        return remember({
          ...empty,
          photos,
          total_results: total,
          next_page: page * perPage < total ? page + 1 : null,
        });
      }
    }
  } catch {
    /* Photo requests can use the secondary provider below. */
  }
  if (imageType === "vector" || imageType === "illustration") return empty;
  const pexelsKey = process.env["PEXELS_API_KEY"];
  if (!pexelsKey) return empty;
  try {
    const params = new URLSearchParams({ query, per_page: String(perPage), page: String(page) });
    const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
      headers: { Authorization: pexelsKey },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return empty;
    const data: {
      photos?: Omit<StockPhoto, "type">[];
      total_results?: number;
      next_page?: string;
    } = await res.json();
    const photos: StockPhoto[] = (Array.isArray(data.photos) ? data.photos : []).map((photo) => ({
      ...photo,
      type: "photo",
    }));
    return remember({
      ...empty,
      photos,
      total_results: Number(data.total_results) || photos.length,
      next_page: data.next_page ? page + 1 : null,
    });
  } catch {
    return empty;
  }
}

/** Only download provider-owned raster images, with bounded size and no redirects. */
export async function readStockImage(
  photo: StockPhoto,
): Promise<{ mimeType: string; data: string } | null> {
  try {
    const url = new URL(photo.src.medium);
    if (
      url.protocol !== "https:" ||
      url.port ||
      url.username ||
      url.password ||
      !["cdn.pixabay.com", "pixabay.com", "images.pexels.com"].includes(url.hostname)
    )
      return null;
    const res = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(8000) });
    const mimeType = (res.headers.get("content-type") || "").split(";")[0]!;
    const maxBytes = 1024 * 1024;
    if (
      !res.ok ||
      !["image/jpeg", "image/png", "image/webp"].includes(mimeType) ||
      Number(res.headers.get("content-length")) > maxBytes ||
      !res.body
    )
      return null;
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) {
          await reader.cancel();
          return null;
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    if (!size) return null;
    return { mimeType, data: Buffer.concat(chunks).toString("base64") };
  } catch {
    return null;
  }
}

