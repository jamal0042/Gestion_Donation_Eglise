import { NextRequest, NextResponse } from "next/server";
import { creerClientServeur, supabaseConfigure } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (!supabaseConfigure()) {
    return NextResponse.json(
      {
        erreur:
          "Connexion Google non configurée. Activez le fournisseur Google dans Supabase puis vérifiez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      },
      { status: 501 }
    );
  }

  const next = request.nextUrl.searchParams.get("next") ?? "/";
  const origine = request.nextUrl.origin;

  const supabase = await creerClientServeur();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origine}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: { prompt: "select_account" },
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(
      new URL("/connexion?erreur=google", request.url)
    );
  }

  return NextResponse.redirect(data.url);
}
