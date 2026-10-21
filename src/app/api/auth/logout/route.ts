import { erreurConfigurationSupabase } from "@/lib/api";
import { creerClientServeur, supabaseConfigure } from "@/lib/supabase/server";

export async function POST() {
  if (!supabaseConfigure()) return erreurConfigurationSupabase();

  const supabase = await creerClientServeur();
  await supabase.auth.signOut();
  return Response.json({ ok: true });
}
