import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { serviceRoleConfigure } from "@/lib/supabase/server";
import CommunicationChrome from "@/components/communication/Chrome";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: React.ReactNode }) {
  if (!serviceRoleConfigure()) {
    redirect("/");
  }
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (session.role !== "communication" && session.role !== "tresorier") {
    redirect("/espace");
  }
  return <CommunicationChrome>{children}</CommunicationChrome>;
}
