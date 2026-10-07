"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { formatDateCourte, formatMontant } from "@/lib/format";

interface DonateurStats {
  id: string;
  nom: string;
  telephone?: string;
  email?: string;
  creeLe: string;
  nbOperations: number;
  total: number;
  dernierDon: string | null;
}

export function DonateursClient() {
  const [donateurs, setDonateurs] = useState<DonateurStats[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/donateurs")
      .then((r) => r.json())
      .then((d) => setDonateurs(d.donateurs ?? []))
      .catch(() => setDonateurs([]));
  }, []);

  const filtres = useMemo(() => {
    if (!donateurs) return [];
    const ql = q.trim().toLowerCase();
    if (!ql) return donateurs;
    return donateurs.filter(
      (d) =>
        d.nom.toLowerCase().includes(ql) ||
        (d.email ?? "").toLowerCase().includes(ql) ||
        (d.telephone ?? "").includes(ql)
    );
  }, [donateurs, q]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Donateurs</h1>
          <p className="mt-1 text-sm text-slate-500">
            {donateurs
              ? `${filtres.length} donateur${filtres.length > 1 ? "s" : ""} · ${formatMontant(
                  filtres.reduce((s, d) => s + d.total, 0)
                )} collectés`
              : "Chargement…"}
          </p>
        </div>
        <div className="relative min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un donateur…"
          />
        </div>
      </div>

      {!donateurs ? (
        <p className="py-20 text-center text-slate-400">Chargement…</p>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Donateur</th>
                  <th>Contact</th>
                  <th className="text-right">Dons</th>
                  <th className="text-right">Total versé</th>
                  <th>Dernier don</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtres.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-slate-400">
                      Aucun donateur trouvé.
                    </td>
                  </tr>
                ) : (
                  filtres.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                            <Users size={15} />
                          </span>
                          <div>
                            <p className="font-semibold text-slate-800">{d.nom}</p>
                            <p className="text-xs text-slate-400">
                              Donateur depuis {formatDateCourte(d.creeLe)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-500">
                        {d.telephone && <p className="whitespace-nowrap">{d.telephone}</p>}
                        {d.email && <p className="whitespace-nowrap">{d.email}</p>}
                        {!d.telephone && !d.email && <span className="text-slate-300">—</span>}
                      </td>
                      <td className="text-right font-semibold text-slate-700">
                        {d.nbOperations}
                      </td>
                      <td className="text-right font-bold text-slate-900">
                        {formatMontant(d.total)}
                      </td>
                      <td className="whitespace-nowrap text-slate-500">
                        {d.dernierDon ? formatDateCourte(d.dernierDon) : "—"}
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/tresorier/operations?donateurId=${d.id}`}
                            className="btn btn-outline btn-sm"
                          >
                            Voir ses dons
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}