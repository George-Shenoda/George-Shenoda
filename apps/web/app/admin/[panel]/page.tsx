import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import AdminApp from "@/components/admin/AdminApp";
import {
  adminPanelConfigured,
  SESSION_COOKIE,
  sessionValid,
} from "@/lib/admin/auth";
import { getRedis, readProjects } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  const expected = process.env.ADMIN_PATH ?? "";
  if (!expected || panel !== expected) notFound();

  const authenticated = adminPanelConfigured()
    ? await sessionValid(getRedis(), (await cookies()).get(SESSION_COOKIE)?.value)
    : false;

  return (
    <AdminApp
      initialAuthenticated={authenticated}
      initialProjects={await readProjects()}
    />
  );
}