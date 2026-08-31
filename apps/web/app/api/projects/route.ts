import { projects } from "@portfolio/shared";

export async function GET() {
  // Public read-only data — no-store ensures fresh data without Vercel/CDN caching.
  return Response.json(projects, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store, must-revalidate",
      "CDN-Cache-Control": "no-store",
      Vary: "Origin",
    },
  });
}
