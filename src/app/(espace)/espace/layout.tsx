import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import EspaceChrome from "@/components/espace/Chrome";
import { supabaseConfigure } from "@/lib/supabase/server";

// L'espace dépend de la session : la navigation peut bloquer sur le serveur.
export const instant = false;

/**
 * Garde d'accès : la lecture de la session est une donnée de requête, elle
 * suspend donc le composant et l'exclut du shell statique (Cache Components).
 * La lecture des cookies doit avoir lieu avant toute redirection, sinon le
 * prerender échoue au lieu de simplement différer le rendu.
 */
async function RequireSession() {
  const session = await getSession();
  if (!supabaseConfigure()) redirect("/");
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
