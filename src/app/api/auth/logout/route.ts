import { creerClientServeur } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await creerClientServeur();
  await supabase.auth.signOut();
  return Response.json({ ok: true });
}
