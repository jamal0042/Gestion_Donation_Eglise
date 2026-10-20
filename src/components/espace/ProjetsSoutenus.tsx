"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, Rocket, TrendingUp } from "lucide-react";
import type { Projet } from "@/lib/types";
import { LIBELLES_STATUT, type StatutProjet } from "@/lib/types";
import { formatMontant } from "@/lib/format";

const COULEURS_STATUT: Record<StatutProjet, string> = {
  en_cours: "bg-brand-100 dark:bg-brand-500/25 text-brand-700 dark:text-brand-300",
  termine: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  planifie: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300",
};

interface ProjetSoutenu {
  projet: Projet;
  total: number;
  nbDons: number;
  partPersonnelle: number;
}

export function ProjetsSoutenus() {
  const [data, setData] = useState<ProjetSoutenu[]>([]);

  useEffect(() => {
    fetch("/api/espace")
      .then((r) => r.json())
      .then((d) => setData(d.projetsSoutenus ?? []))
      .catch(() => setData([]));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Projets que je soutiens
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Suivez l&apos;impact de vos dons sur chaque projet.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="card p-10 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
            <Rocket size={24} />
          </span>
          <p className="mt-4 font-semibold text-slate-700 dark:text-slate-300">
            Aucun projet soutenu pour l&apos;instant
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Fléchez votre don vers un projet précis pour le voir ici.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/projets" className="btn btn-outline btn-sm">
              Voir les projets
            </Link>
            <Link href="/offrande" className="btn btn-primary btn-sm">
              <Heart size={15} /> Donner à un projet
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {data.map((p) => {
            const pctCollecte = Math.min(
              100,
              Math.round(
                (p.projet.collecte / Math.max(1, p.projet.objectif)) * 100
              )
            );
            const pctPerso = Math.round(p.partPersonnelle * 100);
            return (
              <article key={p.projet.id} className="card p-6">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {p.projet.nom}
                  </h2>
                  <span
                    className={`chip shrink-0 ${COULEURS_STATUT[p.projet.statut]}`}
                  >
                    {LIBELLES_STATUT[p.projet.statut]}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {p.projet.description}
                </p>
                <div className="mt-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Ma contribution
                    </span>
                    <span className="text-lg font-extrabold text-brand-700 dark:text-brand-300">
                      {formatMontant(p.total)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {p.nbDons} don{p.nbDons > 1 ? "s" : ""} · représente{" "}
                    {pctPerso}% de la collecte
                  </p>
                </div>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      <TrendingUp
                        size={14}
                        className="text-brand-500 dark:text-brand-300"
                      />
                      Avancement du projet
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {pctCollecte}%
                    </span>
                  </div>
                  <div className="progress-track mt-2">
                    <div
                      className="progress-fill"
                      style={{ width: `${pctCollecte}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {formatMontant(p.projet.collecte)} /{" "}
                    {formatMontant(p.projet.objectif)}
                  </p>
                </div>
                <Link
                  href={`/offrande?projet=${p.projet.id}`}
                  className="btn btn-outline btn-sm mt-5 w-full"
                >
                  <Heart size={15} /> Soutenir à nouveau
                  <ArrowRight size={15} />
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
