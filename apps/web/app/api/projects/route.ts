import { projects } from "@portfolio/shared";

export async function GET() {
  return Response.json(projects);
}
