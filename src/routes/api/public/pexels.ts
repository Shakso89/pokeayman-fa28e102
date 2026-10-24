import { createFileRoute } from "@tanstack/react-router";
import { isMediaType, searchStockMedia } from "@/lib/stock-media";

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
        const src = new URL(request.url).searchParams;
        const query = (src.get("query") || "").slice(0, 100);
        const requestedType = src.get("image_type") || "all";
        if (requestedType !== "all" && !isMediaType(requestedType)) {
          return Response.json({ message: "Invalid image type." }, { status: 400, headers: CORS });
        }
        const perPage = Math.min(Math.max(Math.floor(Number(src.get("per_page")) || 12), 3), 40);
        const page = Math.min(Math.max(Math.floor(Number(src.get("page")) || 1), 1), 50);
        const result = await searchStockMedia(query, requestedType, perPage, page);
        // Keep the legacy picker URL contract. AI matching reads real provider
        // URLs and saves inspected pixels, never a rewritten URL.
        const photos = result.photos.map((photo) => {
          if (!photo.src.tiny?.startsWith("https://cdn.pixabay.com/")) return photo;
          const preview = photo.src.tiny;
          const ext = preview.slice(preview.lastIndexOf("."));
          const base = preview.slice(0, preview.lastIndexOf("_"));
          if (!base || !ext) return photo;
          return {
            ...photo,
            src: {
              ...photo.src,
              original: `${base}_1280${ext}`,
              large: `${base}_1280${ext}`,
              medium: `${base}_640${ext}`,
              small: `${base}_640${ext}`,
            },
          };
        });
        return Response.json(
          { ...result, photos },
          { headers: { ...CORS, "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
