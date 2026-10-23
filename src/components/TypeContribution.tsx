import type { Operation } from "@/lib/types";
import { LIBELLES_TYPE } from "@/lib/types";

/** Libellé court : type principal (+ nombre de contributions supplémentaires). */
export function libelleOperation(operation: Operation): string {
  const supplementaires = Math.max(0, (operation.lignes?.length ?? 0) - 1);
  const libelle = LIBELLES_TYPE[operation.type];
  return supplementaires > 0
    ? `${libelle} +${supplementaires}`
    : libelle;
}

export function detailOperationLisible(operation: Operation): string {
  const lignes = operation.lignes ?? [];
  if (lignes.length === 0) return LIBELLES_TYPE[operation.type];
  return lignes.map((ligne) => LIBELLES_TYPE[ligne.type]).join(" · ");
}

/** Pastille de type, avec le détail des contributions en infobulle. */
export function TypeContribution({ operation }: { operation: Operation }) {
  const lignes = operation.lignes ?? [];

  return (
    <span
      className="chip bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
      title={lignes.length > 1 ? detailOperationLisible(operation) : undefined}
    >
      {lignes.length > 1
        ? `${lignes.length} contributions`
        : LIBELLES_TYPE[operation.type]}
    </span>
  );
}
