import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import TresorierChrome from "@/components/tresorier/Chrome";

async function RequireTresorier() {
  const session = await getSession();
  if (!session) redirect("/connexion?next=/tresorier");
  if (session.role !== "tresorier") redirect("/espace");
  return null;
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Suspense fallback={null}>
        <RequireTresorier />
      </Suspense>
      <TresorierChrome>{children}</TresorierChrome>
    </div>
  );
}