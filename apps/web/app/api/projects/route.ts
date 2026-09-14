import { projects } from "@portfolio/shared";

export async function GET() {
  // ACAO * — public read-only data; the Electron desktop shell loads this
  // cross-origin from its http://127.0.0.1:<port> window.
  // no-store ensures desktop fetch current list without Vercel/CDN edge caching; images themselves remain cacheable.
  return Response.json(projects, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store, must-revalidate",
      "CDN-Cache-Control": "no-store",
      Vary: "Origin",
    },
  });
}
