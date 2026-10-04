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
        const key = process.env["PEXELS_API_KEY"];
        if (!key) return Response.json({ error: "Photo search not configured" }, { status: 500, headers: CORS });
        const src = new URL(request.url).searchParams;
        const query = (src.get("query") || "").slice(0, 100);
        if (!query) return Response.json({ photos: [] }, { headers: CORS });
        const perPage = Math.min(Math.max(Number(src.get("per_page")) || 12, 1), 40);
        const page = Math.min(Math.max(Number(src.get("page")) || 1, 1), 50);
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`;
        const res = await fetch(url, { headers: { Authorization: key } });
        const body = await res.text();
        return new Response(body, {
          status: res.status,
          headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
