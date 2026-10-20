import { creerClientServeur } from "@/lib/supabase/server";
import { trouverProfil } from "@/lib/store";

export async function GET() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return Response.json({ utilisateur: null });

  const profil = await trouverProfil(user.id);
  if (!profil)
    return Response.json({
      utilisateur: {
        id: user.id,
        nom: user.user_metadata?.nom ?? (user.email ?? "").split("@")[0],
        email: user.email ?? "",
        role: "membre",
        creeLe: user.created_at,
        source: "local",
      },
    });

  return Response.json({
    utilisateur: { ...profil, email: user.email ?? "" },
  });
}
