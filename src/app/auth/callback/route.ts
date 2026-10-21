import { NextRequest, NextResponse } from "next/server";
import { creerClientServeur, serviceRoleConfigure } from "@/lib/supabase/server";
import { trouverOuCreerDonateur, trouverProfil } from "@/lib/store";

/**
 * Point de retour OAuth (Google) : échange le code contre une session
 * Supabase, garantit l'existence d'un profil/donateur, puis redirige
 * l'utilisateur vers sa destination.
 */
export async function GET(request: NextRequest) {
  if (!serviceRoleConfigure()) {
    return NextResponse.redirect(
      new URL("/connexion?erreur=google", request.url)
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/espace";
  const destination = next.startsWith("/") ? next : "/espace";

  if (!code) {
    return NextResponse.redirect(
      new URL("/connexion?erreur=google", request.url)
    );
  }

  const supabase = await creerClientServeur();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(
      new URL("/connexion?erreur=google", request.url)
    );
  }

  const profil = await trouverProfil(data.user.id);
  if (!profil) {
    const nom =
      data.user.user_metadata?.full_name ??
      data.user.user_metadata?.name ??
      (data.user.email ?? "").split("@")[0];
    const donateur = await trouverOuCreerDonateur({
      nom,
      email: data.user.email ?? undefined,
    });
    // Le profil est normalement créé par le trigger ; ceci couvre le cas où
    // les métadonnées ne sont pas encore disponibles.
    await supabase.from("profils").upsert({
      id: data.user.id,
      nom,
      role: "membre",
      donateur_id: donateur.id,
      source: "google",
    });
  }

  return NextResponse.redirect(new URL(destination, request.url));
}
