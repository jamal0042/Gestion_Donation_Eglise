"use client";

import { useEffect, useState } from "react";
import { DollarSign, HandCoins, Rocket, Users } from "lucide-react";
import { formatMontant } from "@/lib/format";

interface Stats {
  totalMois: number;
  totalAnnee: number;
  nbDonateurs: number;
  nbProjetsActifs: number;
}

const ELEMENTS = [
  { cle: "totalMois" as const, icone: DollarSign, label: "Reçu ce mois-ci" },
  { cle: "totalAnnee" as const, icone: HandCoins, label: "Reçu cette année" },
  { cle: "nbDonateurs" as const, icone: Users, label: "Donateurs enregistrés" },
  { cle: "nbProjetsActifs" as const, icone: Rocket, label: "Projets en cours" },
];

export function StatsBandeau() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.statistiques ?? null))
      .catch(() => setStats(null));
  }, []);

  if (!stats)
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    );

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {ELEMENTS.map((el) => {
        const valeur = stats[el.cle];
        return (
          <div
            key={el.cle}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <el.icone size={18} />
              </span>
              <p className="text-xs font-medium text-slate-500">{el.label}</p>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">
              {el.cle.startsWith("total")
                ? formatMontant(valeur)
                : valeur.toLocaleString("fr-FR")}
            </p>
          </div>
        );
      })}
    </div>
  );
}