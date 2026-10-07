import { getSession } from "@/lib/auth";
import { sansMotDePasse } from "@/lib/api";
import { trouverUser } from "@/lib/store";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ utilisateur: null });
  const user = await trouverUser(session.sub);
  if (!user) return Response.json({ utilisateur: null });
  return Response.json({ utilisateur: sansMotDePasse(user) });
}
