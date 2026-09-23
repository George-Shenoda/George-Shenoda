"use client";

import { useState } from "react";
import type { Project } from "@portfolio/shared";
import AdminLogin from "./AdminLogin";
import ProjectsManager from "./ProjectsManager";

export default function AdminApp({
  initialAuthenticated,
  initialProjects,
}: {
  initialAuthenticated: boolean;
  initialProjects: Project[];
}) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  async function reloadProjects(): Promise<boolean> {
    try {
      const res = await fetch("/api/admin/projects", { cache: "no-store" });
      if (res.status === 401) {
        setAuthenticated(false);
        return false;
      }
      if (!res.ok) return false;
      const data = (await res.json()) as { projects?: unknown };
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      return true;
    } catch {
      return false;
    }
  }

  async function handleLogin() {
    setAuthenticated(true);
    await reloadProjects();
  }

  return authenticated ? (
    <ProjectsManager
      projects={projects}
      reloadProjects={reloadProjects}
      onLogout={() => setAuthenticated(false)}
    />
  ) : (
    <AdminLogin
      onLogin={() => {
        void handleLogin();
      }}
    />
  );
}