import { NextRequest } from "next/server";
import { requireSession } from "@/lib/admin/auth";
import { readProjects, writeProjects } from "@/lib/admin/store";
import { validateProject } from "@/lib/admin/validate";

export async function GET(request: NextRequest) {
  if (!(await requireSession(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const projects = await readProjects();
  return Response.json({ projects });
}

export async function POST(request: NextRequest) {
  if (!(await requireSession(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = validateProject(payload);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 422 });
  }

  const projects = await readProjects();
  if (projects.some((p) => p.id === result.value.id)) {
    return Response.json(
      { error: "A project with this id already exists." },
      { status: 409 }
    );
  }

  await writeProjects([...projects, result.value]);
  return Response.json({ project: result.value }, { status: 201 });
}