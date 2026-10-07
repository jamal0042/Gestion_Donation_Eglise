export function formatMontant(montant: number): string {
  return `${montant.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} $`;
}

export function formatDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDateCourte(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function montantEnLettres(montant: number): string {
  const unitaires = [
    "",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize",
    "dix-sept",
    "dix-huit",
    "dix-neuf",
  ];
  const dizaines = [
    "",
    "",
    "vingt",
    "trente",
    "quarante",
    "cinquante",
    "soixante",
    "soixante",
    "quatre-vingt",
    "quatre-vingt",
  ];

  function sousCent(n: number): string {
    if (n < 20) return unitaires[n];
    const d = Math.floor(n / 10);
    const u = n % 10;
    if (d === 7 || d === 9) {
      const base = dizaines[d];
      const reste = unitaires[10 + u];
      return u === 0 || d === 7
        ? `${base}-${reste}`
        : `${base}-${reste}`;
    }
    if (u === 0) return dizaines[d] + (d === 8 ? "" : "");
    if (u === 1 && d !== 8) return `${dizaines[d]} et un`;
    return `${dizaines[d]}-${unitaires[u]}`;
  }

  function sousMille(n: number): string {
    const c = Math.floor(n / 100);
    const reste = n % 100;
    if (c === 0) return sousCent(reste);
    const centaine =
      c === 1 ? "cent" : `${unitaires[c]} cent`;
    if (reste === 0) return c === 1 ? "cent" : `${centaine}s`;
    return `${centaine} ${sousCent(reste)}`;
  }

  function nombre(n: number): string {
    if (n === 0) return "zéro";
    const millions = Math.floor(n / 1_000_000);
    const milliers = Math.floor((n % 1_000_000) / 1000);
    const reste = n % 1000;
    const parties: string[] = [];
    if (millions > 0) parties.push(`${sousMille(millions)} million${millions > 1 ? "s" : ""}`);
    if (milliers > 0) parties.push(`${sousMille(milliers)} mille`);
    if (reste > 0) parties.push(sousMille(reste));
    return parties.join(" ");
  }

  const entier = Math.floor(montant);
  const decimal = Math.round((montant - entier) * 100);
  const principal = nombre(entier) + " dollar" + (entier > 1 ? "s" : "");
  if (decimal === 0) return principal;
  return `${principal} et ${nombre(decimal)} cent${decimal > 1 ? "s" : ""}`;
}
