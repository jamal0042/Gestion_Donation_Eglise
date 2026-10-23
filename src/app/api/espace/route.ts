import { getSession } from "@/lib/auth";
import { erreur, erreurConfigurationSupabase } from "@/lib/api";
import { serviceRoleConfigure } from "@/lib/supabase/server";
import {
  getOperationsDonateur,
  getProjets,
  trouverProfil,
} from "@/lib/store";
import type { Operation, Projet, TypeOffrande } from "@/lib/types";
import { deviseDeType } from "@/lib/offrandes";
import type { Devise } from "@/lib/offrandes";

export interface ProjetSoutenu {
  projet: Projet;
  total: number;
  nbDons: number;
  partPersonnelle: number;
}

export interface RepartitionType {
  type: TypeOffrande;
  total: number;
  nombre: number;
}

export interface MoisStat {
  mois: string;
  total: number;
}

export interface TotalDevise {
  devise: Devise;
  totalGeneral: number;
  totalAnnee: number;
  totalMois: number;
  donMoyen: number;
  nombre: number;
}

export async function GET() {
  if (!serviceRoleConfigure()) return erreurConfigurationSupabase();

  const session = await getSession();
  if (!session) return erreur("Authentification requise.", 401);

  if (!session.donateurId) {
    return Response.json({
      profil: null,
      operations: [] as Operation[],
      projetsSoutenus: [] as ProjetSoutenu[],
      repartition: [] as RepartitionType[],
      evolution: [] as MoisStat[],
      parDevise: [] as TotalDevise[],
      statistiques: {
        totalGeneral: 0,
        totalAnnee: 0,
        totalMois: 0,
        nbOperations: 0,
        nbProjetsSoutenus: 0,
        donMoyen: 0,
        premierDon: null as string | null,
        dernierDon: null as string | null,
      },
    });
  }


  const [profil, operations, projets] = await Promise.all([
    trouverProfil(session.sub),
    getOperationsDonateur(session.donateurId),
    getProjets(),
  ]);

  const maintenant = new Date();
  const moisCourant = maintenant.getMonth();
  const anneeCourante = maintenant.getFullYear();

  // Les montants en CDF et en USD ne sont jamais additionnés : les totaux
  // principaux restent exprimés en dollars, le détail CDF est fourni à part.
  const dansLeMois = (date: string) => {
    const d = new Date(date);
    return d.getMonth() === moisCourant && d.getFullYear() === anneeCourante;
  };

  const parDeviseMap = new Map<Devise, TotalDevise>();
  for (const o of operations) {
    const devise = deviseDeType(o.type);
    const courant = parDeviseMap.get(devise) ?? {
      devise,
      totalGeneral: 0,
      totalAnnee: 0,
      totalMois: 0,
      donMoyen: 0,
      nombre: 0,
    };
    courant.totalGeneral += o.montant;
    if (new Date(o.date).getFullYear() === anneeCourante)
      courant.totalAnnee += o.montant;
    if (dansLeMois(o.date)) courant.totalMois += o.montant;
    courant.nombre += 1;
    parDeviseMap.set(devise, courant);
  }
  for (const total of parDeviseMap.values()) {
    total.donMoyen = total.nombre > 0 ? total.totalGeneral / total.nombre : 0;
  }
  const parDevise = [...parDeviseMap.values()].sort((a, b) =>
    a.devise.localeCompare(b.devise)
  );

  const usd = parDeviseMap.get("USD");
  const totalGeneral = usd?.totalGeneral ?? 0;
  const totalAnnee = usd?.totalAnnee ?? 0;
  const totalMois = usd?.totalMois ?? 0;

  const repartitionMap = new Map<TypeOffrande, RepartitionType>();
  for (const o of operations) {
    const courant = repartitionMap.get(o.type) ?? {
      type: o.type,
      total: 0,
      nombre: 0,
    };
    courant.total += o.montant;
    courant.nombre += 1;
    repartitionMap.set(o.type, courant);
  }

  const parProjet = new Map<string, { total: number; nbDons: number }>();
  for (const o of operations) {
    if (!o.projetId) continue;
    const courant = parProjet.get(o.projetId) ?? { total: 0, nbDons: 0 };
    courant.total += o.montant;
    courant.nbDons += 1;
    parProjet.set(o.projetId, courant);
  }

  const projetsSoutenus: ProjetSoutenu[] = [];
  for (const [projetId, agg] of parProjet) {
    const projet = projets.find((p) => p.id === projetId);
    if (!projet) continue;
    projetsSoutenus.push({
      projet,
      total: agg.total,
      nbDons: agg.nbDons,
      partPersonnelle: projet.collecte > 0 ? agg.total / projet.collecte : 0,
    });
  }
  projetsSoutenus.sort((a, b) => b.total - a.total);

  // Évolution des 6 derniers mois (en dollars, pour rester comparable).
  const evolution: MoisStat[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(anneeCourante, moisCourant - i, 1);
    const total = operations
      .filter((o) => {
        const od = new Date(o.date);
        return (
          deviseDeType(o.type) === "USD" &&
          od.getMonth() === d.getMonth() &&
          od.getFullYear() === d.getFullYear()
        );
      })
      .reduce((s, o) => s + o.montant, 0);
    evolution.push({
      mois: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      total,
    });
  }

  const dates = operations
    .map((o) => new Date(o.date).getTime())
    .sort((a, b) => a - b);

  return Response.json({
    profil: profil ? { ...profil, email: session.email } : null,
    operations,
    projetsSoutenus,
    repartition: [...repartitionMap.values()].sort((a, b) => b.total - a.total),
    evolution,
    parDevise,
    statistiques: {
      totalGeneral,
      totalAnnee,
      totalMois,
      nbOperations: operations.length,
      nbProjetsSoutenus: projetsSoutenus.length,
      donMoyen: usd?.donMoyen ?? 0,
      premierDon: dates.length > 0 ? new Date(dates[0]).toISOString() : null,
      dernierDon:
        dates.length > 0
          ? new Date(dates[dates.length - 1]).toISOString()
          : null,
    },
  });
}
