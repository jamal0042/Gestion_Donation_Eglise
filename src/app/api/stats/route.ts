import { getStatistiques } from "@/lib/store";

export async function GET() {
  const statistiques = await getStatistiques();
  return Response.json({ statistiques });
}
