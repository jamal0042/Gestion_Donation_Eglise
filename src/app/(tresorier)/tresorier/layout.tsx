import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/lib/auth";
import TresorierChrome from "@/components/tresorier/Chrome";
import { supabaseConfigure } from "@/lib/supabase/server";

// L'espace trésorier dépend de la session : la navigation peut bloquer.
export const instant = false;

/**
 * Garde d'accès : la lecture de la session suspend le composant et exclut la
 * page du shell statique (Cache Components). `connection()` attend une vraie
 * requête, le client Supabase n'est donc plus exécuté pendant le prerender.
 * Elle doit précéder toute redirection pour que le prerender ne soit pas
 * interrompu par une erreur.
 */
async function RequireTresorier() {
  await connection();
  const session = await getSession();
  if (!supabaseConfigure()) redirect("/");
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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Suspense fallback={null}>
        <RequireTresorier />
      </Suspense>
      <TresorierChrome>{children}</TresorierChrome>
    </div>
  );
}
