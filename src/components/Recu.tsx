import { Church, Landmark } from "lucide-react";
import type { Operation } from "@/lib/types";
import { LIBELLES_METHODE, LIBELLES_TYPE } from "@/lib/types";
import {
  formatDate,
  formatMontant,
  montantEnLettres,
} from "@/lib/format";

interface Props {
  operation: Operation;
  projetNom?: string | null;
}

export function Recu({ operation, projetNom }: Props) {
  return (
    <div className="print-area mx-auto max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-brand-900 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10">
            <Church size={22} />
          </span>
          <div>
            <p className="font-bold leading-tight">Église de Bunia</p>
            <p className="text-xs text-brand-200">
              Avenue de la Paix n° 12, Bunia — Ituri, RDC
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-brand-200">
            Reçu officiel
          </p>
          <p className="font-mono text-sm font-bold text-gold-400">
            {operation.numeroRecu}
          </p>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Donateur
            </p>
            <p className="mt-1 font-bold text-slate-900">
              {operation.donateurNom}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Date
            </p>
            <p className="mt-1 font-bold text-slate-900">
              {formatDate(operation.date)}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Type de contribution
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {LIBELLES_TYPE[operation.type]}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Méthode de paiement
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {LIBELLES_METHODE[operation.methode]}
            </p>
          </div>
          {projetNom && (
            <div className="col-span-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Projet soutenu
              </p>
              <p className="mt-1 font-semibold text-slate-800">{projetNom}</p>
            </div>
          )}
          {operation.note && (
            <div className="col-span-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Note
              </p>
              <p className="mt-1 text-slate-700">{operation.note}</p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl bg-brand-50 p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-500">
                Montant versé
              </p>
              <p className="mt-1 text-3xl font-extrabold text-brand-800">
                {formatMontant(operation.montant)}
              </p>
              <p className="mt-2 text-xs italic text-slate-500">
                {montantEnLettres(operation.montant)} US dollars
              </p>
            </div>
            <Landmark size={30} className="text-brand-300" />
          </div>
        </div>

        <p className="mt-6 border-t border-dashed border-slate-300 pt-5 text-center text-xs text-slate-500">
          L&apos;Église de Bunia vous remercie pour votre générosité. Ce reçu
          fait foi du versement de votre contribution et peut être présenté à
          des fins fiscales ou comptables.
        </p>

        <div className="mt-8 flex items-end justify-between gap-6 text-sm">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Le trésorier
            </p>
            <p className="mt-8 font-semibold text-slate-700">
              Éphraïm Kambale
            </p>
            <div className="mt-1 border-t border-slate-300 pt-1 font-mono text-[10px] text-slate-400">
              Signature
            </div>
          </div>
          <div className="grid h-16 w-16 place-items-center border border-slate-300 text-xs" aria-hidden>
            cachet
          </div>
        </div>
      </div>
    </div>
  );
}