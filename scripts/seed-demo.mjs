/**
 * Remplissage de démonstration de la base Supabase.
 *
 *   node scripts/seed-demo.mjs          → ajoute les données de démonstration
 *   node scripts/seed-demo.mjs --reset  → vide d'abord les tables métier
 *
 * Le script lit les variables de .env.local (NEXT_PUBLIC_SUPABASE_URL et
 * SUPABASE_SERVICE_ROLE_KEY) et travaille en REST comme le fait
 * `src/lib/store.ts`.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");

function lireEnv() {
  const env = {};
  try {
    for (const ligne of readFileSync(join(racine, ".env.local"), "utf8").split(/\r?\n/)) {
      const i = ligne.indexOf("=");
      if (i < 1 || ligne.trim().startsWith("#")) continue;
      env[ligne.slice(0, i).trim()] = ligne.slice(i + 1).trim();
    }
  } catch {
    console.error("Impossible de lire .env.local à la racine du projet.");
    process.exit(1);
  }
  return env;
}

const env = lireEnv();
const URL_SUPABASE = env.NEXT_PUBLIC_SUPABASE_URL;
const CLE = env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_SUPABASE || !CLE) {
  console.error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont obligatoires.");
  process.exit(1);
}

const reset = process.argv.includes("--reset");

async function rest(chemin, { methode = "GET", corps, prefer } = {}) {
  const reponse = await fetch(`${URL_SUPABASE}/rest/v1/${chemin}`, {
    method: methode,
    headers: {
      apikey: CLE,
      Authorization: `Bearer ${CLE}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: corps ? JSON.stringify(corps) : undefined,
  });
  const texte = await reponse.text();
  if (!reponse.ok) {
    throw new Error(`${methode} ${chemin} → ${reponse.status} : ${texte}`);
  }
  return texte ? JSON.parse(texte) : null;
}

const postgrest = (table, corps, prefer = "return=representation") =>
  rest(table, { methode: "POST", corps, prefer });

async function restAuth(chemin, { methode = "GET", corps } = {}) {
  const reponse = await fetch(`${URL_SUPABASE}/auth/v1/${chemin}`, {
    method: methode,
    headers: {
      apikey: CLE,
      Authorization: `Bearer ${CLE}`,
      "Content-Type": "application/json",
    },
    body: corps ? JSON.stringify(corps) : undefined,
  });
  const texte = await reponse.text();
  if (!reponse.ok) {
    throw new Error(`${methode} auth/v1/${chemin} → ${reponse.status} : ${texte}`);
  }
  return texte ? JSON.parse(texte) : null;
}

// ---------------------------------------------------------------------------
// Données de démonstration
// ---------------------------------------------------------------------------
const PROJETS = [
  {
    nom: "Reconstruction du toit de l'église",
    description:
      "Remplacement de la charpente et de la couverture en tôle du toit principal.",
    objectif: 4500,
    statut: "en_cours",
    dateDebut: "2026-02-01",
  },
  {
    nom: "Salle polyvalente de l'église",
    description:
      "Construction d'une salle de 120 places pour les activités des jeunes et des femmes.",
    objectif: 9000,
    statut: "en_cours",
    dateDebut: "2026-04-15",
  },
  {
    nom: "Bibliothèque paroissiale",
    description:
      "Achat de livres bibliques, de Pastorale et de supports pédagogiques.",
    objectif: 1200,
    statut: "termine",
    dateDebut: "2025-11-05",
  },
  {
    nom: "Camp de jeunesse 2026",
    description:
      "Organisation du camp de jeunesse annuel à Nyawera : transport, restauration, hébergement.",
    objectif: 3000,
    statut: "planifie",
    dateDebut: "2026-12-01",
  },
];

const DONATEURS = [
  { nom: "Joseph Kalonji", telephone: "+243 810 000 101", email: "joseph.kalonji@example.cd" },
  { nom: "Esther Mbuyi", telephone: "+243 820 000 102", email: "esther.mbuyi@example.cd" },
  { nom: "Daniel Ilunga", telephone: "+243 830 000 103", email: "daniel.ilunga@example.cd" },
  { nom: "Ruth Tshibangu", telephone: "+243 840 000 104", email: "ruth.tshibangu@example.cd" },
  { nom: "Église Adventiste de Bunia", telephone: null, email: "eglise.bunia@example.cd" },
  { nom: "Grâce Lokwa", telephone: "+243 850 000 106", email: "grace.lokwa@example.cd" },
  { nom: "Samuel Mutombo", telephone: "+243 860 000 107", email: "samuel.mutombo@example.cd" },
  { nom: "Membre de démonstration", telephone: "+243 870 000 108", email: "membre@eglisebunia.org" },
];

// [mois en arrière, jour, donateur, type, méthode, montant, projet (index|null), note]
// Les montants sont exprimés dans la même unité que les objectifs des projets.
const OPERATIONS = [
  [9, 5, 0, "dime", "especes", 150, null, "Dîme du mois"],
  [9, 12, 1, "offrande", "mobile_money", 75, 2, "Offrande dominicale"],
  [9, 20, 2, "don", "virement", 400, 0, "Don pour le toit"],
  [9, 27, 3, "cotisation", "especes", 40, null, "Cotisation des jeunes"],
  [8, 3, 0, "dime", "virement", 180, null, null],
  [8, 10, 4, "offrande", "especes", 900, 1, "Offrande spéciale de l'église"],
  [8, 17, 5, "don", "mobile_money", 120, null, null],
  [8, 24, 6, "dime", "cheque", 200, 1, "Dîme par chèque"],
  [7, 2, 1, "dime", "especes", 130, null, null],
  [7, 9, 7, "offrande", "mobile_money", 95, 0, "Offrande dominicale"],
  [7, 16, 2, "don", "virement", 650, 1, "Don entreprise"],
  [7, 23, 3, "aumone", "especes", 35, null, null],
  [7, 30, 4, "offrande", "especes", 320, 2, null],
  [6, 6, 0, "dime", "mobile_money", 160, null, null],
  [6, 13, 5, "dime", "especes", 110, null, null],
  [6, 20, 6, "don", "cheque", 300, 1, null],
  [6, 27, 7, "offrande", "virement", 150, 0, null],
  [5, 4, 1, "dime", "virement", 170, null, null],
  [5, 11, 2, "cotisation", "especes", 45, null, null],
  [5, 18, 3, "don", "mobile_money", 480, 1, "Don famille"],
  [5, 25, 4, "offrande", "especes", 600, 1, null],
  [4, 1, 0, "dime", "especes", 150, null, null],
  [4, 8, 5, "dime", "cheque", 140, null, null],
  [4, 15, 6, "offrande", "mobile_money", 85, 0, null],
  [4, 22, 7, "don", "virement", 280, 2, "Don pour la bibliothèque"],
  [3, 5, 1, "dime", "especes", 160, null, null],
  [3, 12, 2, "offrande", "especes", 60, 2, null],
  [3, 19, 3, "dime", "mobile_money", 190, null, null],
  [3, 26, 4, "don", "cheque", 700, 1, null],
  [2, 2, 0, "dime", "virement", 175, null, null],
  [2, 9, 5, "offrande", "especes", 75, 0, null],
  [2, 16, 6, "dime", "especes", 120, null, null],
  [2, 23, 7, "don", "mobile_money", 320, 1, null],
  [1, 6, 1, "dime", "especes", 150, null, null],
  [1, 13, 2, "don", "virement", 520, 1, null],
  [1, 20, 3, "offrande", "especes", 55, 2, null],
  [1, 27, 4, "dime", "cheque", 180, null, null],
  [0, 3, 0, "dime", "especes", 165, null, null],
  [0, 10, 5, "dime", "mobile_money", 110, null, null],
  [0, 17, 6, "offrande", "virement", 135, 0, null],
  [0, 24, 7, "don", "especes", 420, 1, null],
];

const COMPTE_DEMO = {
  email: "membre@eglisebunia.org",
  motDePasse: "Membre2026!",
  nom: "Membre de démonstration",
};

function dateIlYa(moisEnArriere, jour) {
  const maintenant = new Date();
  const d = new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth() - moisEnArriere, jour));
  return d.toISOString();
}

function numeroRecu(annee, numero) {
  return `REC-${annee}-${String(numero).padStart(4, "0")}`;
}

async function vider() {
  console.log("Vidage des tables métier…");
  await rest("operations?id=neq.00000000-0000-0000-0000-000000000000", { methode: "DELETE" });
  await rest("projets?id=neq.00000000-0000-0000-0000-000000000000", { methode: "DELETE" });
  await rest("donateurs?id=neq.00000000-0000-0000-0000-000000000000", { methode: "DELETE" });
}

async function main() {
  if (reset) await vider();

  const dejaLa = await rest("projets?select=id&limit=1");
  if (dejaLa.length > 0 && !reset) {
    console.log("La base contient déjà des projets : utilisez --reset pour repartir de zéro.");
    return;
  }

  console.log("Insertion des projets…");
  const projets = [];
  for (const p of PROJETS) {
    const [ligne] = await postgrest("projets", {
      nom: p.nom,
      description: p.description,
      objectif: p.objectif,
      collecte: 0,
      statut: p.statut,
      date_debut: p.dateDebut,
    });
    projets.push(ligne);
  }

  console.log("Insertion des donateurs…");
  const donateurs = [];
  for (const d of DONATEURS) {
    const [ligne] = await postgrest("donateurs", {
      nom: d.nom,
      telephone: d.telephone,
      email: d.email,
    });
    donateurs.push(ligne);
  }

  console.log("Insertion des opérations…");
  const compteursParAnnee = new Map();
  for (const [mois, jour, indexDonateur, type, methode, montant, indexProjet, note] of OPERATIONS) {
    const date = dateIlYa(mois, jour);
    const anneeRecu = new Date(date).getUTCFullYear();
    const numero = (compteursParAnnee.get(anneeRecu) ?? 0) + 1;
    compteursParAnnee.set(anneeRecu, numero);
    await postgrest("operations", {
      numero_recu: numeroRecu(anneeRecu, numero),
      date,
      montant,
      type,
      methode,
      donateur_id: donateurs[indexDonateur].id,
      donateur_nom: donateurs[indexDonateur].nom,
      projet_id: indexProjet === null ? null : projets[indexProjet].id,
      note,
      cree_par: "seed",
    });
  }

  console.log("Recalcul des collectes…");
  for (const p of projets) {
    await rest("rpc/recalculer_collecte", { methode: "POST", corps: { p_projet_id: p.id } });
  }

  console.log("Création du compte de démonstration…");
  const utilisateurs = await restAuth("admin/users?per_page=200");
  const existant = Array.isArray(utilisateurs?.users)
    ? utilisateurs.users.find((u) => u.email === COMPTE_DEMO.email)
    : null;

  const donateurDemo = donateurs[donateurs.length - 1];
  if (existant) {
    console.log("Le compte de démonstration existe déjà : lien du profil…");
    await rest(`profils?id=eq.${existant.id}`, {
      methode: "PATCH",
      corps: { nom: COMPTE_DEMO.nom, donateur_id: donateurDemo.id },
      prefer: "return=representation",
    });
  } else {
    await restAuth("admin/users", {
      methode: "POST",
      corps: {
        email: COMPTE_DEMO.email,
        password: COMPTE_DEMO.motDePasse,
        email_confirm: true,
        user_metadata: {
          nom: COMPTE_DEMO.nom,
          telephone: donateurDemo.telephone ?? "",
          role: "membre",
          donateur_id: donateurDemo.id,
          source: "local",
        },
      },
    });
    console.log(`Compte créé : ${COMPTE_DEMO.email} / ${COMPTE_DEMO.motDePasse}`);
  }

  const synthese = await rest("projets?select=nom,objectif,collecte,statut&order=date_debut");
  console.log("\nProjets :");
  for (const p of synthese) {
    console.log(`  - ${p.nom} : ${p.collecte} / ${p.objectif} (${p.statut})`);
  }
  const total = await rest("operations?select=montant");
  console.log(`\nOpérations : ${total.length} pour un total de ${total.reduce((s, o) => s + Number(o.montant), 0)}`);
}

main().catch((e) => {
  console.error("Échec du remplissage :", e.message);
  process.exit(1);
});
