import { createFileRoute } from "@tanstack/react-router";
import { isMediaType, searchStockMedia } from "@/lib/stock-media";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Cache-Control",
};

export const Route = createFileRoute("/api/search-image")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        const src = new URL(request.url).searchParams;
        const q = (src.get("q") || src.get("query") || src.get("word") || "").slice(0, 100).trim();
        const requestedType = src.get("image_type") || src.get("type") || "all";
        const type = requestedType !== "all" && isMediaType(requestedType) ? requestedType : "all";
        const perPage = Math.min(Math.max(Math.floor(Number(src.get("per_page")) || 12), 3), 40);
        const page = Math.min(Math.max(Math.floor(Number(src.get("page")) || 1), 1), 50);

        const result = await searchStockMedia(q, type, perPage, page);
        const images = result.photos.map((p) => ({
          id: String(p.id),
          url: p.src.large || p.src.medium || p.src.original,
          photographer: p.photographer,
          photographer_url: p.photographer_url,
          sourceUrl: p.url,
          alt: p.alt,
          type: p.type,
        }));

        return Response.json(
          {
            query: q,
            images,
            photos: result.photos,
            total: result.total_results,
            page: result.page,
          },
          { headers: { ...CORS, "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
