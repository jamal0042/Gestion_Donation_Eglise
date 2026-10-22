"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Printer } from "lucide-react";
import type { Operation } from "@/lib/types";
import { LIBELLES_TYPE } from "@/lib/types";
import { formatDate, formatMontant } from "@/lib/format";

export function RecuListe() {
  const [operations, setOperations] = useState<Operation[]>([]);

  useEffect(() => {
    fetch("/api/operations?mine=1")
      .then((r) => r.json())
      .then((d) => setOperations(d.operations ?? []))
      .catch(() => setOperations([]));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl dark:text-slate-100">
          Mes reçus officiels
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Tous vos reçus imprimables en un seul endroit.
        </p>
      </div>

      {operations.length === 0 ? (
        <div className="card p-10 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
            <FileText size={24} />
          </span>
          <p className="mt-4 font-semibold text-slate-700 dark:text-slate-300">
            Aucun reçu disponible
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Vos reçus apparaîtront ici après chaque don.
          </p>
          <Link href="/offrande" className="btn btn-primary btn-sm mt-6">
            Faire un don
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {operations.map((o) => (
            <article key={o.id} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs font-bold text-brand-700 dark:text-brand-300">
                    {o.numeroRecu}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {formatDate(o.date)}
                  </p>
                </div>
                <span className="chip bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {LIBELLES_TYPE[o.type]}
                </span>
              </div>
              <p className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {formatMontant(o.montant)}
              </p>
              <div className="mt-5 flex gap-2">
                <Link
                  href={`/recu/${o.id}`}
                  className="btn btn-primary btn-sm flex-1"
                >
                  <Printer size={15} /> Imprimer
                </Link>
                <Link
                  href={`/recu/${o.id}`}
                  target="_blank"
                  className="btn btn-outline btn-sm"
                >
                  Aperçu
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
