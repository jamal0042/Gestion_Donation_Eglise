"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Devise } from "@/lib/offrandes";
import { DEVISES, MONTANTS_RAPIDES, groupesParDevise } from "@/lib/offrandes";
import { formatMontantDevise } from "@/lib/format";

/** Une contribution en cours de saisie (montant vide tant que non saisi). */
export interface LigneSaisie {
  type: string;
  montant: number | "";
}

export const LIGNE_VIDE: LigneSaisie = { type: "", montant: "" };

export const MAX_LIGNES = 12;

/** Somme des montants valides d'une saisie. */
export function totalSaisie(lignes: LigneSaisie[]): number {
  return lignes.reduce(
    (total, ligne) =>
      total +
      (typeof ligne.montant === "number" && ligne.montant > 0
        ? ligne.montant
        : 0),
    0
  );
}

export function SelecteurDevise({
  valeur,
  onChange,
}: {
  valeur: Devise;
  onChange: (devise: Devise) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Devise du don"
      className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800"
    >
      {DEVISES.map((devise) => (
        <button
          key={devise}
          type="button"
          onClick={() => onChange(devise)}
          aria-pressed={valeur === devise}
          className={`rounded-lg px-4 py-1.5 text-sm font-bold transition ${
            valeur === devise
              ? "bg-brand-600 text-white shadow-sm"
              : "text-slate-500 hover:text-brand-700 dark:text-slate-300 dark:hover:text-brand-300"
          }`}
        >
          {devise === "USD" ? "USD ($)" : "CDF (FC)"}
        </button>
      ))}
    </div>
  );
}

interface Props {
  lignes: LigneSaisie[];
  onChange: (lignes: LigneSaisie[]) => void;
  devise: Devise;
  /** Préfixe des identifiants (plusieurs formulaires sur une page). */
  idPrefix: string;
}

/**
 * Éditeur de contributions multiples : un même don peut soutenir plusieurs
 * types d'offrande (comme plusieurs articles dans une vente).
 */
export function LignesOffrande({ lignes, onChange, devise, idPrefix }: Props) {
  const groupes = groupesParDevise(devise);
  const montantsRapides = MONTANTS_RAPIDES[devise];
  const total = totalSaisie(lignes);

  function modifier(index: number, valeurs: Partial<LigneSaisie>) {
    onChange(
      lignes.map((ligne, i) => (i === index ? { ...ligne, ...valeurs } : ligne))
    );
  }

  function retirer(index: number) {
    if (lignes.length === 1) return;
    onChange(lignes.filter((_, i) => i !== index));
  }

  function ajouter() {
    if (lignes.length >= MAX_LIGNES) return;
    onChange([...lignes, { ...LIGNE_VIDE }]);
  }

  return (
    <div className="space-y-3">
      {lignes.map((ligne, index) => {
        const idType = `${idPrefix}-type-${index}`;
        const idMontant = `${idPrefix}-montant-${index}`;
        const montantChoisi =
          typeof ligne.montant === "number" ? ligne.montant : null;

        return (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/40"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 sm:grid-cols-[minmax(0,1fr)_9rem_auto]">
              <div className="col-span-2 min-w-0 sm:col-span-1">
                <label className="label" htmlFor={idType}>
                  Contribution {index + 1}
                </label>
                <select
                  id={idType}
                  className="select"
                  required
                  value={ligne.type}
                  onChange={(e) => modifier(index, { type: e.target.value })}
                >
                  <option value="">Choisir une contribution…</option>
                  {groupes.map((groupe) => (
                    <optgroup key={groupe.famille} label={groupe.famille}>
                      {groupe.items.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.libelle}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="min-w-0">
                <label className="label" htmlFor={idMontant}>
                  Montant ({devise})
                </label>
                <input
                  id={idMontant}
                  className="input tabular w-full"
                  type="number"
                  required
                  min={1}
                  step="any"
                  inputMode="decimal"
                  placeholder="0"
                  value={ligne.montant}
                  onChange={(e) =>
                    modifier(index, {
                      montant:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => retirer(index)}
                disabled={lignes.length === 1}
                className="btn btn-ghost btn-sm btn-square shrink-0 text-red-600 disabled:opacity-30 dark:text-red-400"
                title="Retirer cette contribution"
                aria-label={`Retirer la contribution ${index + 1}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {montantsRapides.map((montant) => (
                <button
                  key={montant}
                  type="button"
                  onClick={() => modifier(index, { montant })}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    montantChoisi === montant
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-slate-300 text-slate-600 hover:border-brand-400 dark:border-slate-700 dark:text-slate-300"
                  }`}
                >
                  {montant} {devise}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={ajouter}
          disabled={lignes.length >= MAX_LIGNES}
          className="btn btn-outline btn-sm w-full sm:w-auto"
        >
          <Plus size={15} /> Ajouter une contribution
        </button>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {lignes.length} contribution{lignes.length > 1 ? "s" : ""} ·{" "}
          <span className="tabular font-bold text-brand-800 dark:text-brand-300">
            {formatMontantDevise(total, devise)}
          </span>
        </p>
      </div>
    </div>
  );
}
