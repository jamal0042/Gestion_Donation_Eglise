/**
 * Catalogue des offrandes de l'église.
 *
 * Source de vérité unique : les libellés, les codes (valeurs de l'énumération
 * PostgreSQL `public.type_offrande`) et les devises utilisées par toute
 * l'application.
 *
 * Chaque offre est déclinée en deux devises : CDF (francs congolais) et USD.
 * Les types historiques (dîme, offrande, don, aumône, cotisation) sont
 * conservés et restent exprimés en dollars.
 */

export type Devise = "CDF" | "USD";

export const DEVISES: Devise[] = ["CDF", "USD"];

/** Offrandes historiques, sans devise propre (conservées pour la compatibilité). */
export const OFFRANDES_GENERALES = [
  { code: "dime", libelle: "Dîme" },
  { code: "offrande", libelle: "Offrande" },
  { code: "don", libelle: "Don" },
  { code: "aumone", libelle: "Aumône" },
  { code: "cotisation", libelle: "Cotisation" },
] as const;

/** Offrandes propres à l'église, déclinées ensuite par devise. */
const BASES = [
  { code: "zaka", libelle: "ZAKA", famille: "ZAKA" },
  { code: "zaka_prison", libelle: "ZAKA PRISON", famille: "ZAKA" },
  {
    code: "zaka_chungu_chungu",
    libelle: "ZAKA CHUNGU CHUNGU",
    famille: "ZAKA",
  },
  { code: "zaka_jumla", libelle: "ZAKA JUMLA", famille: "ZAKA" },
  { code: "pourcentage_50", libelle: "50%", famille: "Pourcentages" },
  { code: "pourcentage_10", libelle: "10%", famille: "Pourcentages" },
  { code: "pourcentage_40", libelle: "40%", famille: "Pourcentages" },
  { code: "sadaka_prison", libelle: "SADAKA PRISON", famille: "SADAKA" },
  {
    code: "sadaka_semaine",
    libelle: "SADAKA SEMAINE (JEUDI, etc.)",
    famille: "SADAKA",
  },
  { code: "sadaka_jumla", libelle: "SADAKA JUMLA", famille: "SADAKA" },
  { code: "maendeleo", libelle: "MAENDELEO", famille: "MAENDELEO" },
  { code: "shukrani", libelle: "SHUKRANI", famille: "SHUKRANI" },
  { code: "bur_kim", libelle: "BUR / KIM", famille: "BUR / KIM" },
  { code: "raves", libelle: "RAVES", famille: "RAVES" },
  { code: "evangel", libelle: "EVANGEL", famille: "EVANGEL" },
  { code: "eds_enfant", libelle: "EDS ENFANT", famille: "EDS ENFANT" },
  { code: "sabbat_13", libelle: "13ème SABBAT", famille: "13ème SABBAT" },
  {
    code: "mifem_dorcas",
    libelle: "MIFEM & DORCAS",
    famille: "MIFEM & DORCAS",
  },
  { code: "ja", libelle: "J.A", famille: "J.A" },
  {
    code: "communication",
    libelle: "COMMUNICATION",
    famille: "COMMUNICATION",
  },
  {
    code: "bon_samaritain",
    libelle: "BON SAMARITAIN",
    famille: "BON SAMARITAIN",
  },
  {
    code: "choral_habari_njema",
    libelle: "CHORAL HABARI NJEMA",
    famille: "CHORAL",
  },
  {
    code: "choral_la_voix_de_l_esperance",
    libelle: "CHORAL LA VOIX DE L'ESPERANCE",
    famille: "CHORAL",
  },
  { code: "choral_i_will_go", libelle: "CHORAL I WILL GO", famille: "CHORAL" },
  { code: "choral_children", libelle: "CHORAL CHILDREN", famille: "CHORAL" },
  {
    code: "arambe",
    libelle: "ARAMBE (………………………….)",
    famille: "ARAMBE",
  },
  {
    code: "construction_eglise",
    libelle: "CONSTRUCTION EGLISE",
    famille: "CONSTRUCTION EGLISE",
  },
  {
    code: "mission_kibali_ituri",
    libelle: "MISSION KIBALI ITURI",
    famille: "MISSION KIBALI ITURI",
  },
  {
    code: "sda_bunia_ville",
    libelle: "SDA BUNIA VILLE",
    famille: "SDA BUNIA VILLE",
  },
  { code: "total", libelle: "TOTAL", famille: "TOTAL" },
] as const;

export type CodeBase = (typeof BASES)[number]["code"];
export type CodeOffrandeGenerale = (typeof OFFRANDES_GENERALES)[number]["code"];
export type CodeOffrandeDevise = `${CodeBase}_cdf` | `${CodeBase}_usd`;
export type CodeOffrande = CodeOffrandeGenerale | CodeOffrandeDevise;

export interface OffrandeItem {
  code: CodeOffrande;
  libelle: string;
  famille: string;
  devise: Devise | null;
}

export const FAMILLE_GENERALE = "Contributions générales";

export const ITEMS_OFFRANDES: OffrandeItem[] = [
  ...OFFRANDES_GENERALES.map((item) => ({
    code: item.code as CodeOffrandeGenerale,
    libelle: item.libelle,
    famille: FAMILLE_GENERALE,
    devise: null,
  })),
  ...BASES.flatMap((base) =>
    DEVISES.map((devise) => ({
      code: `${base.code}_${devise.toLowerCase()}` as CodeOffrandeDevise,
      libelle: `${base.libelle} ${devise}`,
      famille: base.famille,
      devise,
    }))
  ),
];

export const GROUPES_OFFRANDES: { famille: string; items: OffrandeItem[] }[] = [
  ...ITEMS_OFFRANDES.reduce((groupes, item) => {
    const existant = groupes.find((g) => g.famille === item.famille);
    if (existant) existant.items.push(item);
    else groupes.push({ famille: item.famille, items: [item] });
    return groupes;
  }, [] as { famille: string; items: OffrandeItem[] }[]),
];

export const LIBELLES_TYPE: Record<CodeOffrande, string> = Object.fromEntries(
  ITEMS_OFFRANDES.map((item) => [item.code, item.libelle])
) as Record<CodeOffrande, string>;

export const CODES_OFFRANDES: CodeOffrande[] = ITEMS_OFFRANDES.map(
  (item) => item.code
);

/** Devise d'une offrande : déduite du code (CDF) ou dollars par défaut. */
export function deviseDeType(code: string): Devise {
  return code.endsWith("_cdf") ? "CDF" : "USD";
}

/** Libellé lisible d'une offrande (repli sur le code si inconnu). */
export function libelleDeType(code: string): string {
  return LIBELLES_TYPE[code as CodeOffrande] ?? code;
}

/** Vérifie qu'un code correspond à une offrande connue. */
export function estCodeOffrande(code: string): code is CodeOffrande {
  return Object.prototype.hasOwnProperty.call(LIBELLES_TYPE, code);
}

/** Totaux séparés par devise (les deux montants ne sont jamais additionnés). */
export function totalParDevise(
  operations: { type: string; montant: number }[]
): Record<Devise, number> {
  const totaux: Record<Devise, number> = { CDF: 0, USD: 0 };
  for (const operation of operations) {
    totaux[deviseDeType(operation.type)] += operation.montant;
  }
  return totaux;
}
