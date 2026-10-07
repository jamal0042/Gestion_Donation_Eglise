"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Printer,
  ReceiptText,
  TrendingUp,
  UserRound,
  Wallet,
} from "lucide-react";
import type { Operation, Utilisateur } from "@/lib/types";
import { LIBELLES_METHODE, LIBELLES_TYPE, type TypeOffrande } from "@/lib/types";
import { formatDateCourte, formatMontant } from "@/lib/format";

export function EspaceClient() {
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [operations, setOperations] = useState<Operation[] | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/operations?mine=1").then((r) => r.json()),
    ])
      .then(([me, ops]) => {
        setUser(me.utilisateur ?? null);
        setOperations(ops.operations ?? []);
      })
      .catch(() => {});
  }, []);

  const total = (operations ?? []).reduce((s, o) => s + o.montant, 0);

  const parType = new Map<TypeOffrande, number>();
  for (const o of operations ?? []) {
    parType.set(o.type, (parType.get(o.type) ?? 0) + o.montant);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-700 text-white">
            <UserRound size={26} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {user ? `Bonjour, ${user.nom.split(" ")[0]} 👋` : "Mon espace donateur"}
            </h1>
            <p className="text-sm text-slate-500">
              Vos contributions et reçus en un seul endroit.
            </p>
          </div>
        </div>
        <Link href="/offrande" className="btn btn-gold">
          <Heart size={16} />
          Faire une offrande
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Wallet size={16} className="text-brand-600" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total donné
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {formatMontant(total)}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <ReceiptText size={16} className="text-brand-600" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Contributions
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {operations ? operations.length : "…"}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <TrendingUp size={16} className="text-brand-600" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Répartition
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {[...parType.entries()].map(([t, montant]) => (
              <div key={t} className="flex justify-between text-sm">
                <span className="text-slate-600">{LIBELLES_TYPE[t]}</span>
                <span className="font-semibold text-slate-900">
                  {formatMontant(montant)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-8 overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-bold text-slate-900">Mes reçus</h2>
        </div>
        {operations === null ? (
          <p className="px-6 py-10 text-center text-slate-400">
            Chargement de vos contributions…
          </p>
        ) : operations.length === 0 ? (
          <p className="px-6 py-10 text-center text-slate-500">
            Vous n&apos;avez pas encore fait de contribution.{" "}
            <Link href="/offrande" className="font-semibold text-brand-700">
              Faire mon premier don
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>N° reçu</th>
                  <th>Type</th>
                  <th>Méthode</th>
                  <th className="text-right">Montant</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {operations.map((o) => (
                  <tr key={o.id}>
                    <td className="whitespace-nowrap">{formatDateCourte(o.date)}</td>
                    <td className="font-mono text-xs font-semibold text-slate-500">
                      {o.numeroRecu}
                    </td>
                    <td>{LIBELLES_TYPE[o.type]}</td>
                    <td className="whitespace-nowrap">{LIBELLES_METHODE[o.methode]}</td>
                    <td className="text-right font-bold text-slate-900">
                      {formatMontant(o.montant)}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/recu/${o.id}`}
                        className="btn btn-outline btn-sm"
                        title="Imprimer le reçu"
                      >
                        <Printer size={14} />
                        Reçu
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}