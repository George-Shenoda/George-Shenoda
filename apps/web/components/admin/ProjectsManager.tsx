"use client";

import { useState } from "react";
import type { Project } from "@portfolio/shared";
import { Button } from "@/components/ui/button";

interface FormState {
  id: string;
  title: string;
  link: string;
  image: string;
  techstack: string;
}

interface SaveResult {
  ok: boolean;
  status: number;
  error?: string;
}

const EMPTY_FORM: FormState = {
  id: "",
  title: "",
  link: "",
  image: "",
  techstack: "",
};

const FIELD_LABELS: Record<keyof FormState, string> = {
  id: "Id (slug)",
  title: "Title",
  link: "Link",
  image: "Image path",
  techstack: "Tech stack (comma separated)",
};

async function saveProject(
  url: string,
  method: "POST" | "PUT",
  body: Record<string, unknown>
): Promise<SaveResult> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return { ok: res.ok, status: res.status, error: data.error };
}

export default function ProjectsManager({
  projects,
  reloadProjects,
  onLogout,
}: {
  projects: Project[];
  reloadProjects: () => Promise<boolean>;
  onLogout: () => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function payloadFromForm(): Omit<Project, "id"> & { id: string } {
    return {
      id: form.id.trim(),
      title: form.title.trim(),
      link: form.link.trim(),
      image: form.image.trim(),
      techstack: form.techstack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setNotice("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = editingId
        ? await saveProject(
            `/api/admin/projects/${encodeURIComponent(editingId)}`,
            "PUT",
            payloadFromForm()
          )
        : await saveProject("/api/admin/projects", "POST", payloadFromForm());

      if (!result.ok) {
        setError(result.error ?? "Save failed.");
        if (result.status === 401) onLogout();
        return;
      }
      setNotice(editingId ? "Project updated." : "Project added.");
      resetForm();
      await reloadProjects();
    } catch {
      setError("Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(project: Project) {
    if (busy) return;
    if (!window.confirm(`Delete "${project.title}"?`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(
        `/api/admin/projects/${encodeURIComponent(project.id)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        if (res.status === 401) onLogout();
        else setError("Delete failed.");
        return;
      }
      setNotice("Project deleted.");
      await reloadProjects();
    } catch {
      setError("Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  function handleEdit(project: Project) {
    setEditingId(project.id);
    setForm({
      id: project.id,
      title: project.title,
      link: project.link,
      image: project.image,
      techstack: project.techstack.join(", "),
    });
    setError("");
    setNotice("");
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      onLogout();
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects Admin</h1>
        <Button variant="outline" onClick={handleLogout}>
          Sign Out
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#192020]"
      >
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? `Edit: ${editingId}` : "Add Project"}
        </h2>
        <div className="grid gap-4">
          {(Object.keys(FIELD_LABELS) as Array<keyof FormState>).map((field) => (
            <div key={field}>
              <label
                htmlFor={`field-${field}`}
                className="mb-1.5 block text-sm font-medium text-muted-foreground"
              >
                {FIELD_LABELS[field]}
              </label>
              <input
                id={`field-${field}`}
                value={form[field]}
                onChange={(event) => updateField(field, event.target.value)}
                placeholder={
                  field === "image"
                    ? "/assets/projects/example.png"
                    : field === "techstack"
                      ? "Next.js, TypeScript"
                      : undefined
                }
                disabled={editingId !== null && field === "id"}
                className="w-full rounded-lg border border-black/10 bg-background px-3 py-2 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:border-white/10"
              />
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : editingId ? "Update" : "Add Project"}
          </Button>
          {editingId && (
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
        {notice && (
          <p className="mt-3 text-sm text-green-600 dark:text-green-400">{notice}</p>
        )}
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </form>

      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Projects ({projects.length})
        </h2>
        {projects.length === 0 && (
          <p className="text-muted-foreground">No projects yet.</p>
        )}
        <ul className="flex flex-col gap-3">
          {projects.map((project) => (
            <li
              key={project.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#192020]"
            >
              <div className="min-w-0">
                <p className="font-semibold">{project.title}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {project.id} · {project.techstack.join(", ")}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(project)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(project)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}