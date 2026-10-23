"use client";

import { GROUPES_OFFRANDES } from "@/lib/offrandes";
import type { CodeOffrande } from "@/lib/offrandes";

interface Props {
  id?: string;
  value: string;
  onChange: (code: CodeOffrande) => void;
  className?: string;
  /** Libellé de l'option vide (filtres). */
  placeholder?: string;
}

/**
 * Sélecteur d'offrande regroupé par famille (ZAKA, SADAKA, CHORAL…) et par
 * devise (CDF / USD). Utilisé dans le formulaire public, l'espace trésorier
 * et l'espace personnel.
 */
export function SelectTypeOffrande({
  id,
  value,
  onChange,
  className = "select",
  placeholder,
}: Props) {
  return (
    <select
      id={id}
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value as CodeOffrande)}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {GROUPES_OFFRANDES.map((groupe) => (
        <optgroup key={groupe.famille} label={groupe.famille}>
          {groupe.items.map((item) => (
            <option key={item.code} value={item.code}>
              {item.libelle}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
