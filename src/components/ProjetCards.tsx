"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Heart, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { Projet } from "@/lib/types";
import { LIBELLES_STATUT, type StatutProjet } from "@/lib/types";
import { formatMontant } from "@/lib/format";

const COULEURS_STATUT: Record<StatutProjet, string> = {
  en_cours: "bg-brand-100 dark:bg-brand-500/25 text-brand-700 dark:text-brand-300",
  termine: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  planifie: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300",
};

export function ProjetCards({ limite }: { limite?: number }) {
  const [projets, setProjets] = useState<Projet[] | null>(null);

  useEffect(() => {
    fetch("/api/projets")
      .then((r) => r.json())
      .then((d) => setProjets(d.projets ?? []))
      .catch(() => setProjets([]));
  }, []);

  if (!projets)
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card h-64 animate-pulse bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    );

  const affiches = limite ? projets.filter((p) => p.statut === "en_cours").slice(0, limite) : projets;

  if (affiches.length === 0)
    return (
      <p className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
        Aucun projet publié pour le moment.
      </p>
    );

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {affiches.map((projet) => {
        const pct =
          projet.objectif > 0
            ? Math.min(100, Math.round((projet.collecte / projet.objectif) * 100))
            : 0;
        return (
          <article
            key={projet.id}
            className="card flex flex-col p-6 transition hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{projet.nom}</h3>
              <span className={`chip shrink-0 ${COULEURS_STATUT[projet.statut]}`}>
                {LIBELLES_STATUT[projet.statut]}
              </span>
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {projet.description}
            </p>
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-brand-700 dark:text-brand-300">
                  {formatMontant(projet.collecte)}
                </span>
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <TrendingUp size={14} className="text-brand-500 dark:text-brand-300" />
                  {pct}%
                </span>
              </div>
              <div className="progress-track mt-2">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Objectif : {formatMontant(projet.objectif)}
              </p>
            </div>
            <Link
              href={`/offrande?projet=${projet.id}`}
              className="btn btn-primary btn-sm mt-5 w-full"
            >
              <Heart size={15} />
              Soutenir ce projet
              <ArrowRight size={15} />
            </Link>
          </article>
        );
      })}
    </div>
  );
}