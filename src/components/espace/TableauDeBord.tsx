"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Heart,
  Printer,
  ReceiptText,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { Operation, Projet, TypeOffrande } from "@/lib/types";
import { LIBELLES_METHODE, LIBELLES_TYPE } from "@/lib/types";
import { deviseDeType } from "@/lib/offrandes";
import { formatDateCourte, formatMontant, formatMontantDevise } from "@/lib/format";

interface Espace {
  profil: { nom: string } | null;
  operations: Operation[];
  projetsSoutenus: {
    projet: Projet;
    total: number;
    nbDons: number;
    partPersonnelle: number;
  }[];
  repartition: { type: TypeOffrande; total: number; nombre: number }[];
  evolution: { mois: string; total: number }[];
  parDevise: {
    devise: "CDF" | "USD";
    totalGeneral: number;
    totalAnnee: number;
    totalMois: number;
    donMoyen: number;
    nombre: number;
  }[];
  statistiques: {
    totalGeneral: number;
    totalAnnee: number;
    totalMois: number;
    nbOperations: number;
    nbProjetsSoutenus: number;
    donMoyen: number;
    premierDon: string | null;
    dernierDon: string | null;
  };
}

export function TableauDeBord() {
  const [data, setData] = useState<Espace | null>(null);

  useEffect(() => {
    fetch("/api/espace")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="space-y-5">
        <div className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>
    );
  }

  const { statistiques: s, operations, repartition, evolution, projetsSoutenus } =
    data;
  const cdf = data.parDevise?.find((p) => p.devise === "CDF");
  const maxEvolution = Math.max(1, ...evolution.map((e) => e.total));
  const maxRepartition = Math.max(1, ...repartition.map((r) => r.total));
  const dernieres = operations.slice(0, 5);
  const prenom = data.profil?.nom.split(" ")[0] ?? "";

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-600 p-5 text-white sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-sm font-medium text-brand-100">
            Bonjour{prenom ? ` ${prenom}` : ""} 👋
          </p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
            Votre espace personnel de donateur
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-brand-100">
            Retrouvez ici toutes vos contributions, vos reçus officiels et la
            progression des projets que vous soutenez.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/offrande" className="btn btn-gold btn-sm">
              <Heart size={15} /> Faire une offrande
            </Link>
            <Link
              href="/espace/recus"
              className="btn btn-sm border border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <Printer size={15} /> Mes reçus
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total donné",
            valeur: formatMontant(s.totalGeneral),
            icone: Wallet,
            sous: `${s.nbOperations} contribution${s.nbOperations > 1 ? "s" : ""}${
              cdf && cdf.totalGeneral > 0
                ? ` · ${formatMontantDevise(cdf.totalGeneral, "CDF")}`
                : ""
            }`,
          },
          {
            label: "Cette année",
            valeur: formatMontant(s.totalAnnee),
            icone: TrendingUp,
            sous: `Ce mois : ${formatMontant(s.totalMois)}${
              cdf && cdf.totalAnnee > 0
                ? ` · ${formatMontantDevise(cdf.totalAnnee, "CDF")}`
                : ""
            }`,
          },
          {
            label: "Don moyen",
            valeur: formatMontant(s.donMoyen),
            icone: ReceiptText,
            sous: s.premierDon
              ? `Depuis le ${formatDateCourte(s.premierDon)}`
              : "Aucun don",
          },
          {
            label: "Projets soutenus",
            valeur: String(s.nbProjetsSoutenus),
            icone: Heart,
            sous: s.dernierDon
              ? `Dernier don : ${formatDateCourte(s.dernierDon)}`
              : "Aucun projet",
          },
        ].map((c) => (
          <div key={c.label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {c.label}
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-300">
                <c.icone size={16} />
              </span>
            </div>
            <p className="tabular mt-2 truncate text-xl font-extrabold text-slate-900 sm:mt-3 sm:text-2xl dark:text-slate-100">
              {c.valeur}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {c.sous}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="card p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-brand-600 dark:text-brand-300" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100">
              Évolution de mes dons en USD (6 derniers mois)
            </h2>
          </div>
          {s.nbOperations === 0 ? (
            <p className="mt-6 text-center text-sm text-slate-400">
              Aucune donnée pour le moment.
            </p>
          ) : (
            <div className="mt-5 flex h-32 items-end gap-1.5 overflow-hidden sm:mt-6 sm:h-40 sm:gap-3">
              {evolution.map((e) => (
                <div key={e.mois} className="flex flex-1 flex-col items-center gap-2">
                  <span className="truncate text-[9px] font-semibold text-slate-500 sm:text-[10px] dark:text-slate-400">
                    {e.total > 0 ? formatMontant(e.total) : ""}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all"
                    style={{
                      height: `${Math.max(4, (e.total / maxEvolution) * 100)}%`,
                    }}
                    title={formatMontant(e.total)}
                  />
                  <span className="truncate text-[10px] font-medium text-slate-500 sm:text-xs dark:text-slate-400">
                    {e.mois}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 sm:p-6">
          <h2 className="font-bold text-slate-900 dark:text-slate-100">
            Répartition par type
          </h2>
          {repartition.length === 0 ? (
            <p className="mt-6 text-center text-sm text-slate-400">
              Aucun don.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {repartition.map((r) => (
                <div key={r.type}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {LIBELLES_TYPE[r.type]}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {formatMontantDevise(r.total, deviseDeType(r.type))}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${(r.total / maxRepartition) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6 dark:border-slate-800">
            <h2 className="font-bold text-slate-900 dark:text-slate-100">
              Mes derniers dons
            </h2>
            <Link
              href="/espace/dons"
              className="text-sm font-semibold text-brand-700 dark:text-brand-300 hover:text-brand-800 dark:hover:text-brand-200"
            >
              Tout voir
            </Link>
          </div>
          {dernieres.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Vous n&apos;avez pas encore fait de don.{" "}
              <Link
                href="/offrande"
                className="font-semibold text-brand-700 dark:text-brand-300"
              >
                Faire mon premier don
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {dernieres.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {LIBELLES_TYPE[o.type]}
                      {o.projetId ? " · projet" : ""}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDateCourte(o.date)} ·{" "}
                      {LIBELLES_METHODE[o.methode]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {formatMontantDevise(o.montant, deviseDeType(o.type))}
                    </p>
                    <Link
                      href={`/recu/${o.id}`}
                      className="text-xs font-semibold text-brand-700 dark:text-brand-300"
                    >
                      Reçu
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6 dark:border-slate-800">
            <h2 className="font-bold text-slate-900 dark:text-slate-100">
              Projets que je soutiens
            </h2>
            <Link
              href="/espace/projets"
              className="text-sm font-semibold text-brand-700 dark:text-brand-300 hover:text-brand-800 dark:hover:text-brand-200"
            >
              Tout voir
            </Link>
          </div>
          {projetsSoutenus.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Vous pouvez flécher un don vers un projet précis.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {projetsSoutenus.slice(0, 4).map((p) => {
                const pct = Math.min(
                  100,
                  Math.round(
                    (p.projet.collecte / Math.max(1, p.projet.objectif)) * 100
                  )
                );
                return (
                  <li key={p.projet.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                        {p.projet.nom}
                      </span>
                      <span className="shrink-0 text-xs font-bold text-brand-700 dark:text-brand-300">
                        {pct}%
                      </span>
                    </div>
                    <div className="progress-track mt-2">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Ma contribution : {formatMontant(p.total)} ·{" "}
                      {formatMontant(p.projet.collecte)} /{" "}
                      {formatMontant(p.projet.objectif)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Link href="/espace/recus" className="btn btn-outline btn-sm">
          Voir tous mes reçus <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
