import { io } from "next/cache";
import { erreurConfigurationSupabase } from "@/lib/api";
import { serviceRoleConfigure } from "@/lib/supabase/server";
import { getStatistiques } from "@/lib/store";

export async function GET() {
  // Les statistiques sont recalculées à chaque requête : la lecture est
  // exclue du shell statique (Cache Components).
  await io();
  if (!serviceRoleConfigure()) return erreurConfigurationSupabase();

  const statistiques = await getStatistiques();
  return Response.json({ statistiques });
}
