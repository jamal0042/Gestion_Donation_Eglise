"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  DollarSign,
  HandCoins,
  Printer,
  QrCode,
  ReceiptText,
  Rocket,
  Users,
} from "lucide-react";
import type { Operation, Projet } from "@/lib/types";
import { LIBELLES_TYPE } from "@/lib/types";
import { deviseDeType } from "@/lib/offrandes";
import { formatDateCourte, formatMontant, formatMontantDevise } from "@/lib/format";

interface Stats {
  totalMois: number;
  totalAnnee: number;
  totalGeneral: number;
  nbOperations: number;
  nbDonateurs: number;
  nbProjetsActifs: number;
  parType: { type: keyof typeof LIBELLES_TYPE; total: number; nombre: number }[];
  parDevise: {
    devise: "CDF" | "USD";
    totalMois: number;
    totalAnnee: number;
    totalGeneral: number;
    nombre: number;
  }[];
}

export function DashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/operations").then((r) => r.json()),
      fetch("/api/projets").then((r) => r.json()),
    ])
      .then(([s, o, p]) => {
        setStats(s.statistiques ?? null);
        setOperations(o.operations ?? []);
        setProjets(p.projets ?? []);
      })
      .catch(() => {});
  }, []);

  const dernieres = operations.slice(0, 8);
  const maxType = Math.max(1, ...(stats?.parType.map((p) => p.total) ?? [1]));

  const cdf = stats?.parDevise.find((p) => p.devise === "CDF");

  const cartes = [
    {
      label: "Reçu ce mois-ci",
      valeur: stats?.totalMois,
      icone: DollarSign,
      sous: cdf && cdf.totalMois > 0 ? formatMontantDevise(cdf.totalMois, "CDF") : null,
    },
    {
      label: "Reçu cette année",
      valeur: stats?.totalAnnee,
      icone: HandCoins,
      sous: cdf && cdf.totalAnnee > 0 ? formatMontantDevise(cdf.totalAnnee, "CDF") : null,
    },
    { label: "Opérations", valeur: stats?.nbOperations, icone: ReceiptText, sous: null },
    { label: "Donateurs", valeur: stats?.nbDonateurs, icone: Users, sous: null },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {cartes.map((c) => (
          <div key={c.label} className="card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs dark:text-slate-400">
                {c.label}
              </span>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 sm:h-9 sm:w-9 dark:bg-brand-500/15 dark:text-brand-300">
                <c.icone size={16} />
              </span>
            </div>
            <p className="tabular mt-2 truncate text-xl font-extrabold text-slate-900 sm:mt-3 sm:text-2xl dark:text-slate-100">
              {c.valeur === undefined
                ? "…"
                : typeof c.valeur === "number" && c.label.startsWith("Reçu")
                ? formatMontant(c.valeur)
                : c.valeur.toLocaleString("fr-FR")}
            </p>
            {c.sous && (
              <p className="tabular mt-0.5 truncate text-xs font-semibold text-brand-600 dark:text-brand-300">
                + {c.sous}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="card p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-slate-900 dark:text-slate-100">
              Répartition par type
            </h2>
            <Link
              href="/tresorier/operations"
              className="shrink-0 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
            >
              Voir tout
            </Link>
          </div>
          {!stats ? (
            <p className="mt-6 text-center text-slate-400">Chargement…</p>
          ) : stats.parType.length === 0 ? (
            <p className="mt-6 text-center text-slate-400">Aucune donnée.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {stats.parType.map((p) => (
                <div key={p.type}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-semibold text-slate-700 dark:text-slate-300">
                      {LIBELLES_TYPE[p.type]}
                    </span>
                    <span className="shrink-0 text-slate-500 dark:text-slate-400">
                      {formatMontantDevise(p.total, deviseDeType(p.type))}{" "}
                      <span className="text-xs text-slate-400">
                        ({p.nombre} op.)
                      </span>
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${(p.total / maxType) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 sm:p-6">
          <h2 className="font-bold text-slate-900 dark:text-slate-100">
            Projets en cours
          </h2>
          <div className="mt-5 space-y-5">
            {projets
              .filter((p) => p.statut === "en_cours")
              .slice(0, 3)
              .map((p) => {
                const pct =
                  p.objectif > 0
                    ? Math.min(100, Math.round((p.collecte / p.objectif) * 100))
                    : 0;
                return (
                  <div key={p.id}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0 truncate font-semibold text-slate-700 dark:text-slate-300">
                        {p.nom}
                      </span>
                      <span className="shrink-0 text-xs font-bold text-brand-700 dark:text-brand-300">
                        {pct}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="tabular mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                      {formatMontant(p.collecte)} / {formatMontant(p.objectif)}
                    </p>
                  </div>
                );
              })}
          </div>
          <Link
            href="/tresorier/projets"
            className="btn btn-outline btn-sm mt-6 w-full"
          >
            <Rocket size={15} /> Gérer les projets
          </Link>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-slate-100">
            Dernières opérations
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/tresorier/qr" className="btn btn-outline btn-sm">
              <QrCode size={15} /> QR code
            </Link>
            <Link href="/tresorier/operations" className="btn btn-primary btn-sm">
              Toutes les opérations
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Mobile : liste de cartes (plus lisible qu'un tableau) */}
        <ul className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">
          {dernieres.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-slate-400">
              Aucune opération.
            </li>
          ) : (
            dernieres.map((o) => (
              <li key={o.id} className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {o.donateurNom}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      {formatDateCourte(o.date)} · {LIBELLES_TYPE[o.type]} ·{" "}
                      <span className="font-mono">{o.numeroRecu}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tabular text-sm font-bold text-slate-900 dark:text-slate-100">
                      {formatMontantDevise(o.montant, deviseDeType(o.type))}
                    </p>
                    <Link
                      href={`/recu/${o.id}`}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 dark:text-brand-300"
                    >
                      <Printer size={12} /> Reçu
                    </Link>
                  </div>
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
                <th>Date</th>
                <th>N° reçu</th>
                <th>Donateur</th>
                <th>Type</th>
                <th className="text-right">Montant</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {dernieres.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Aucune opération.
                  </td>
                </tr>
              ) : (
                dernieres.map((o) => (
                  <tr key={o.id}>
                    <td className="whitespace-nowrap">{formatDateCourte(o.date)}</td>
                    <td className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {o.numeroRecu}
                    </td>
                    <td className="max-w-[220px] truncate font-medium text-slate-800 dark:text-slate-200">
                      {o.donateurNom}
                    </td>
                    <td>{LIBELLES_TYPE[o.type]}</td>
                    <td className="tabular text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatMontantDevise(o.montant, deviseDeType(o.type))}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/recu/${o.id}`}
                        className="btn btn-ghost btn-sm btn-square"
                        title="Imprimer le reçu"
                        aria-label={`Imprimer le reçu ${o.numeroRecu}`}
                      >
                        <Printer size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
