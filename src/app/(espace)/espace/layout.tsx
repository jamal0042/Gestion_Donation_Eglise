import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import EspaceChrome from "@/components/espace/Chrome";
import { supabaseConfigure } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function RequireSession() {
  if (!supabaseConfigure()) {
    redirect("/");
  }
  const session = await getSession();
  if (!session) redirect("/connexion?next=/espace");
  return null;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex min-h-screen">
        <Suspense fallback={null}>
          <RequireSession />
        </Suspense>
        <EspaceChrome>{children}</EspaceChrome>
      </div>
    </div>
  );
}
