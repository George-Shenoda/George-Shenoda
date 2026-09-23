import { NextRequest } from "next/server";
import { requireSession } from "@/lib/admin/auth";
import { readProjects, writeProjects } from "@/lib/admin/store";
import { PROJECT_ID_PATTERN, validateProject } from "@/lib/admin/validate";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireSession(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!PROJECT_ID_PATTERN.test(id)) {
    return Response.json({ error: "Invalid project id." }, { status: 400 });
  }

  const projects = await readProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) {
    return Response.json({ error: "Project not found." }, { status: 404 });
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
  if (result.value.id !== id) {
    return Response.json(
      { error: "Project id cannot be changed." },
      { status: 400 }
    );
  }

  const next = [...projects];
  next[index] = result.value;
  await writeProjects(next);
  return Response.json({ project: result.value });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireSession(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!PROJECT_ID_PATTERN.test(id)) {
    return Response.json({ error: "Invalid project id." }, { status: 400 });
  }

  const projects = await readProjects();
  const next = projects.filter((p) => p.id !== id);
  if (next.length === projects.length) {
    return Response.json({ error: "Project not found." }, { status: 404 });
  }

  await writeProjects(next);
  return Response.json({ success: true });
}