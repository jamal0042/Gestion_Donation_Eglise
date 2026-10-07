import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { ajouterUser, trouverOuCreerDonateur, trouverUserParEmail } from "@/lib/store";

function redirigerErreur(request: NextRequest): NextResponse {
  return NextResponse.redirect(
    new URL(
      "/connexion?erreur=google",
      request.url
    )
  );
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!clientId || !clientSecret || !code) return redirigerErreur(request);

  let next = "/";
  if (state) {
    try {
      const decoded = JSON.parse(
        Buffer.from(state, "base64url").toString("utf-8")
      ) as { next?: string };
      if (decoded.next?.startsWith("/")) next = decoded.next;
    } catch {
      next = "/";
    }
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: new URL("/api/auth/google/callback", request.url).toString(),
        grant_type: "authorization_code",
      }),
    });
    const tokens = (await tokenRes.json()) as { access_token?: string };
    if (!tokens.access_token) return redirigerErreur(request);

    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    const profile = (await profileRes.json()) as {
      email?: string;
      name?: string;
      id?: string;
    };
    if (!profile.email) return redirigerErreur(request);

    let user = await trouverUserParEmail(profile.email);
    if (!user) {
      const nom = profile.name?.trim() || profile.email.split("@")[0];
      const donateur = await trouverOuCreerDonateur({
        nom,
        email: profile.email,
      });
      user = await ajouterUser({
        nom,
        email: profile.email,
        role: "membre",
        donateurId: donateur.id,
        source: "google",
      });
    }

    await createSession({
      sub: user.id,
      nom: user.nom,
      email: user.email,
      role: user.role,
      donateurId: user.donateurId,
    });

    return NextResponse.redirect(new URL(next, request.url));
  } catch {
    return redirigerErreur(request);
  }
}
