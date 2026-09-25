"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onLogin();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Login failed.");
    } catch {
      setError("Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-sm flex-col items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#192020]"
      >
        <h1 className="mb-4 text-xl font-bold">Admin Sign In</h1>
        <label
          htmlFor="admin-password"
          className="mb-1.5 block text-sm font-medium text-muted-foreground"
        >
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-black/10 bg-background px-3 py-2 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 dark:border-white/10"
        />
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          disabled={busy || password.length === 0}
          className="mt-5 w-full"
        >
          {busy ? "Signing in…" : "Sign In"}
        </Button>
      </form>
    </main>
  );
}