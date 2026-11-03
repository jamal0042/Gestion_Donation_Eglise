import { getTousContenus } from "@/lib/store";
import Link from "next/link";
import { PlusCircle, Radio } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Page() {
  const contenus = await getTousContenus();
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold sm:text-2xl">Prédications & contenus</h1>
          <p className="text-sm text-slate-500">Publiez et diffusez en ligne.</p>
        </div>
        <Link href="/communication/nouveau" className="btn btn-primary btn-sm"><PlusCircle size={15} /> Nouveau</Link>
      </div>
      <div className="card overflow-hidden">
        <table className="table-base">
          <thead><tr><th>Titre</th><th>Type</th><th>Orateur</th><th>Date</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {contenus.length === 0 ? <tr><td colSpan={6} className="py-10 text-center text-slate-400">Aucun contenu</td></tr> : contenus.map((c) => (
              <tr key={c.id}>
                <td className="font-semibold">{c.titre}</td>
                <td>{c.type}</td>
                <td>{c.orateur || "-"}</td>
                <td>{c.dateEvenement ? new Date(c.dateEvenement).toLocaleDateString("fr-FR") : "-"}</td>
                <td>{c.publie ? "Publié" : "Brouillon"}</td>
                <td className="text-right"><Link href={`/communication/nouveau?id=${c.id}`} className="btn btn-ghost btn-sm">Modifier</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
