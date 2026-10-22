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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl dark:text-slate-100">
            Donateurs
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {donateurs
              ? `${filtres.length} donateur${filtres.length > 1 ? "s" : ""} · ${formatMontant(
                  filtres.reduce((s, d) => s + d.total, 0)
                )} collectés`
              : "Chargement…"}
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un donateur…"
            aria-label="Rechercher un donateur"
          />
        </div>
      </div>

      {!donateurs ? (
        <p className="py-20 text-center text-slate-400">Chargement…</p>
      ) : (
        <div className="card overflow-hidden">
          {/* Mobile : cartes */}
          <ul className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">
            {filtres.length === 0 ? (
              <li className="px-4 py-14 text-center text-sm text-slate-400">
                Aucun donateur trouvé.
              </li>
            ) : (
              filtres.map((d) => (
                <li key={d.id} className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                        <Users size={15} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {d.nom}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {d.telephone || d.email || "Aucun contact"}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="tabular text-sm font-bold text-slate-900 dark:text-slate-100">
                        {formatMontant(d.total)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {d.nbOperations} don{d.nbOperations > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      Dernier don : {d.dernierDon ? formatDateCourte(d.dernierDon) : "—"}
                    </p>
                    <Link
                      href={`/tresorier/operations?donateurId=${d.id}`}
                      className="btn btn-outline btn-sm shrink-0"
                    >
                      Ses dons
                    </Link>
                  </div>
                </li>
              ))
            )}
          </ul>

          {/* Ordinateur : tableau */}
          <div className="scroll-x hidden md:block">
            <table className="table-base min-w-[720px]">
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
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                            <Users size={15} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800 dark:text-slate-200">
                              {d.nom}
                            </p>
                            <p className="truncate text-xs text-slate-400">
                              Donateur depuis {formatDateCourte(d.creeLe)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-500 dark:text-slate-400">
                        {d.telephone && <p className="whitespace-nowrap">{d.telephone}</p>}
                        {d.email && <p className="whitespace-nowrap">{d.email}</p>}
                        {!d.telephone && !d.email && <span className="text-slate-300">—</span>}
                      </td>
                      <td className="text-right font-semibold text-slate-700 dark:text-slate-300">
                        {d.nbOperations}
                      </td>
                      <td className="tabular text-right font-bold text-slate-900 dark:text-slate-100">
                        {formatMontant(d.total)}
                      </td>
                      <td className="whitespace-nowrap text-slate-500 dark:text-slate-400">
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