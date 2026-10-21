import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ProjetsSoutenus } from "@/components/espace/ProjetsSoutenus";
import { supabaseConfigure } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  if (!supabaseConfigure()) {
    redirect("/");
  }
  const session = await getSession();
  if (!session) redirect("/connexion?next=/espace");
  return <ProjetsSoutenus />;
}
