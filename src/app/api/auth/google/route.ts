import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        erreur:
          "Connexion Google non configurée. Renseignez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET dans .env.local puis relancez le serveur.",
      },
      { status: 501 }
    );
  }

  const next = request.nextUrl.searchParams.get("next") ?? "/";
  const callback = new URL("/api/auth/google/callback", request.url).toString();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callback,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
    state: Buffer.from(JSON.stringify({ next })).toString("base64url"),
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
