import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Cache-Control",
};

export const Route = createFileRoute("/api/public/pexels")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        const pixabayKey = process.env["PIXABAY_API_KEY"] || "58123311-8a89c5e2df18a2650add733fa";
        const pexelsKey = process.env["PEXELS_API_KEY"];

        const src = new URL(request.url).searchParams;
        const query = (src.get("query") || "").slice(0, 100);
        if (!query) return Response.json({ photos: [] }, { headers: CORS });

        const perPage = Math.min(Math.max(Number(src.get("per_page")) || 12, 3), 40);
        const page = Math.min(Math.max(Number(src.get("page")) || 1, 1), 50);
        const imageType = src.get("image_type") || "all";

        // Primary: Pixabay (educational clipart, vectors, illustrations & photos with SafeSearch)
        if (pixabayKey) {
          try {
            const pixabayUrl = `https://pixabay.com/api/?key=${encodeURIComponent(pixabayKey)}&q=${encodeURIComponent(query)}&image_type=${encodeURIComponent(imageType)}&safesearch=true&per_page=${perPage}&page=${page}`;
            const res = await fetch(pixabayUrl);
            if (res.ok) {
              const data = await res.json();
              const hits = Array.isArray(data?.hits) ? data.hits : [];
              const photos = hits.map((hit: any) => {
                const preview = hit.previewURL || "";
                let permanent640 = preview;
                let permanent1280 = preview;
                if (preview.includes("cdn.pixabay.com")) {
                  const ext = preview.slice(preview.lastIndexOf("."));
                  const base = preview.slice(0, preview.lastIndexOf("_"));
                  if (base && ext) {
                    permanent640 = `${base}_640${ext}`;
                    permanent1280 = `${base}_1280${ext}`;
                  }
                }
                return {
                  id: hit.id,
                  photographer: hit.user || "Pixabay Artist",
                  photographer_url: hit.pageURL || "",
                  url: hit.pageURL || "",
                  src: {
                    original: permanent1280 || hit.largeImageURL || preview,
                    large: permanent1280 || hit.largeImageURL || preview,
                    medium: permanent640 || hit.webformatURL || preview,
                    small: permanent640 || preview,
                    tiny: preview || permanent640,
                  },
                  alt: hit.tags || query,
                  type: hit.type || "photo",
                };
              });

              const totalHits = Number(data?.totalHits) || hits.length;
              const hasNext = page * perPage < totalHits;

              return Response.json(
                {
                  photos,
                  page,
                  per_page: perPage,
                  total_results: totalHits,
                  next_page: hasNext ? page + 1 : null,
                },
                {
                  headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" },
                }
              );
            }
          } catch (pixabayErr) {
            console.error("Pixabay search error, falling back:", pixabayErr);
          }
        }

        // Secondary / Fallback: Pexels API
        if (pexelsKey) {
          try {
            const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`;
            const res = await fetch(pexelsUrl, { headers: { Authorization: pexelsKey } });
            const body = await res.text();
            return new Response(body, {
              status: res.status,
              headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" },
            });
          } catch (pexelsErr) {
            console.error("Pexels search error:", pexelsErr);
          }
        }

        return Response.json({ error: "Photo search not configured" }, { status: 500, headers: CORS });
      },
    },
  },
});
