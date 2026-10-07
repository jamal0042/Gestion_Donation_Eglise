import { getSession } from "@/lib/auth";
import { erreur } from "@/lib/api";
import { getDonateurs, getOperations } from "@/lib/store";

export async function GET() {
  const session = await getSession();
  if (!session) return erreur("Authentification requise.", 401);
  if (session.role !== "tresorier")
    return erreur("Accès réservé au trésorier.", 403);

  const [donateurs, operations] = await Promise.all([
    getDonateurs(),
    getOperations(),
  ]);

  const resultats = donateurs.map((d) => {
    const siens = operations.filter((o) => o.donateurId === d.id);
    return {
      ...d,
      nbOperations: siens.length,
      total: siens.reduce((s, o) => s + o.montant, 0),
      dernierDon: siens.length > 0 ? siens[0].date : null,
    };
  });

  resultats.sort((a, b) => b.total - a.total);

  return Response.json({ donateurs: resultats });
}
