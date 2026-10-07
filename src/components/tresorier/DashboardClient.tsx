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
import { formatDateCourte, formatMontant } from "@/lib/format";

interface Stats {
  totalMois: number;
  totalAnnee: number;
  totalGeneral: number;
  nbOperations: number;
  nbDonateurs: number;
  nbProjetsActifs: number;
  parType: { type: keyof typeof LIBELLES_TYPE; total: number; nombre: number }[];
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Reçu ce mois-ci", valeur: stats?.totalMois, icone: DollarSign },
          { label: "Reçu cette année", valeur: stats?.totalAnnee, icone: HandCoins },
          { label: "Opérations", valeur: stats?.nbOperations, icone: ReceiptText },
          { label: "Donateurs", valeur: stats?.nbDonateurs, icone: Users },
        ].map((c) => (
          <div key={c.label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {c.label}
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <c.icone size={16} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">
              {c.valeur === undefined
                ? "…"
                : typeof c.valeur === "number" && c.label.startsWith("Reçu")
                ? formatMontant(c.valeur)
                : c.valeur.toLocaleString("fr-FR")}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Répartition par type</h2>
            <Link
              href="/tresorier/operations"
              className="text-sm font-semibold text-brand-700 hover:text-brand-800"
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
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">
                      {LIBELLES_TYPE[p.type]}
                    </span>
                    <span className="text-slate-500">
                      {formatMontant(p.total)}{" "}
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

        <div className="card p-6">
          <h2 className="font-bold text-slate-900">Projets en cours</h2>
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
                      <span className="font-semibold text-slate-700">{p.nom}</span>
                      <span className="shrink-0 text-xs font-bold text-brand-700">
                        {pct}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
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
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="font-bold text-slate-900">Dernières opérations</h2>
          <div className="flex gap-2">
            <Link href="/tresorier/qr" className="btn btn-outline btn-sm">
              <QrCode size={15} /> QR code
            </Link>
            <Link href="/tresorier/operations" className="btn btn-primary btn-sm">
              Toutes les opérations
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
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
                    <td className="font-mono text-xs font-semibold text-slate-500">
                      {o.numeroRecu}
                    </td>
                    <td className="font-medium text-slate-800">{o.donateurNom}</td>
                    <td>{LIBELLES_TYPE[o.type]}</td>
                    <td className="text-right font-bold text-slate-900">
                      {formatMontant(o.montant)}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/recu/${o.id}`}
                        className="btn btn-ghost btn-sm"
                        title="Imprimer le reçu"
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