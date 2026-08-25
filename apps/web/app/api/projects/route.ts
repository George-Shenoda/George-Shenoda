import { projects } from "@portfolio/shared";

export async function GET() {
  // ACAO * — public read-only data; the Electron desktop shell loads this
  // cross-origin from its http://127.0.0.1:<port> window.
  return Response.json(projects, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
