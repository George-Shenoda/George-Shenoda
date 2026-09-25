import { readProjects } from "@/lib/admin/store";

export async function GET() {
  // Public read-only data — Redis store (seeded from bundled projects),
  // falls back to the bundled list when Redis is unavailable.
  const projects = await readProjects();
  return Response.json(projects, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store, must-revalidate",
      "CDN-Cache-Control": "no-store",
      Vary: "Origin",
    },
  });
}