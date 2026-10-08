import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Church,
  Compass,
  Globe,
  HeartHandshake,
  HelpingHand,
  Landmark,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

export const metadata: Metadata = { title: "Notre vision" };

const IDENTITE = [
  {
    icone: Globe,
    titre: "« Adventiste »",
    texte:
      "Du latin adventus, « arrivée », « venue », « avènement » : l'attente du retour du Christ annoncé par la Bible, au cœur de notre espérance.",
  },
  {
    icone: CalendarDays,
    titre: "« Septième jour »",
    texte:
      "Le sabbat (samedi), le septième jour de la semaine, considéré comme le jour biblique de repos et d'adoration.",
  },
  {
    icone: Landmark,
    titre: "Une famille mondiale",
    texte:
      "Plus de 22 millions de membres à travers le monde, 12e plus grande organisation religieuse, avec un siège à Silver Spring (Maryland, États-Unis).",
  },
];

const HISTOIRE = [
  {
    annee: "1831 – 1844",
    titre: "Le mouvement millériste",
    texte:
      "Un vaste mouvement d'étude des prophéties de Daniel et de l'Apocalypse se répand dans le monde. Plus de quatre-vingts commentateurs de la Bible situent la prophétie des « 2 300 jours » de Daniel 8:14 vers le milieu du XIXe siècle, y voyant l'annonce du retour du Christ. Des voix comme Joseph Wolff, Manuel de Lacunza, Louis Gaussen, Edward Irving et Thomas Playford portent ce message sur plusieurs continents.",
  },
  {
    annee: "1844",
    titre: "L'étude du sanctuaire",
    texte:
      "Après la déception de 1844, les croyants retournent aux Écritures et découvrent la dimension du ministère de Christ dans le sanctuaire céleste. Ce « réveil » donne naissance au mouvement qui prendra le nom d'adventiste.",
  },
  {
    annee: "1860",
    titre: "Organisation de l'Église",
    texte:
      "Sous la conduite de Joseph Bates, James White et Ellen White (née Ellen Gould Harmon), l'Église adventiste du septième jour est officiellement organisée à Battle Creek, dans le Michigan.",
  },
  {
    annee: "1863",
    titre: "La Conférence générale",
    texte:
      "La direction mondiale de l'Église est établie : la Conférence générale, qui coordonne encore aujourd'hui l'œuvre adventiste sur tous les continents.",
  },
];

const VALEURS = [
  {
    icone: BookOpen,
    titre: "Fidélité",
    texte: "Servir Dieu avec intégrité dans la gestion des ressources qui nous sont confiées.",
  },
  {
    icone: Compass,
    titre: "Direction divine",
    texte: "Toutes nos décisions financières sont prises sous la conduite du Saint-Esprit.",
  },
  {
    icone: HeartHandshake,
    titre: "Solidarité",
    texte: "Nous prenons soin des veuves, des orphelins et de toute personne en détresse.",
  },
  {
    icone: ShieldCheck,
    titre: "Liberté de conscience",
    texte: "Respecter la dignité de chacun, dans le respect de l'ordre public et du dialogue interreligieux.",
  },
];

const OBJECTIFS = [
  {
    icone: HelpingHand,
    titre: "Viser l'autonomie",
    texte: "Accompagner chaque membre et chaque famille vers la responsabilité et l'autonomie spirituelle et matérielle.",
  },
  {
    icone: Target,
    titre: "Bâtir pour l'avenir",
    texte: "Investir dans des infrastructures durables : temple, salles de formation, orphelinat, forage d'eau.",
  },
  {
    icone: HeartHandshake,
    titre: "Servir la communauté",
    texte: "Être une église ouverte sur son quartier : éducation des enfants, secours aux démunis, présence en temps de crise.",
  },
];

export default function Page() {
  return (
    <div>
      <section className="bg-brand-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-400">
            <Church size={14} /> Église adventiste du septième jour
          </span>
          <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
            Notre vision &amp; notre histoire
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-brand-100">
            L&apos;Église adventiste du septième jour (EASJ) est une confession
            chrétienne protestante née d&apos;un mouvement de réveil. Notre
            communauté de <strong className="font-semibold text-white">Bunia ville</strong>,
            en Ituri, en est un membre vivant et local.
          </p>
        </div>
      </section>

      {/* Identité */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
            Qui sommes-nous
          </span>
          <h2 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Comprendre notre nom
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            Les adventistes du septième jour sont très attachés aux principes de
            la liberté de conscience, dans le respect de l&apos;ordre public et
            de la dignité de la personne, ainsi qu&apos;à la séparation des
            Églises et de l&apos;État et au dialogue interreligieux. Ils
            défendent activement la liberté religieuse, notamment au sein
            d&apos;associations comme l&apos;IRLA et l&apos;AIDLR.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {IDENTITE.map((i) => (
            <div key={i.titre} className="card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <i.icone size={20} />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">{i.titre}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {i.texte}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Histoire mondiale + locale */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Notre histoire
            </span>
            <h2 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              D&apos;un réveil mondial à Bunia
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Notre identité s&apos;enracine dans un mouvement de réveil du
              XIX<sup>e</sup> siècle, aujourd&apos;hui présent sur toute la
              terre — et particulièrement dans notre ville de Bunia.
            </p>
          </div>

          <ol className="mt-10 space-y-6 border-l-2 border-brand-200 pl-6 sm:pl-8">
            {HISTOIRE.map((e) => (
              <li key={e.annee} className="relative">
                <span className="absolute -left-[35px] top-1 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-brand-600 sm:-left-[43px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                  {e.annee}
                </span>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {e.titre}
                </h3>
                <p className="mt-1 leading-relaxed text-slate-600">
                  {e.texte}
                </p>
              </li>
            ))}
            <li className="relative">
              <span className="absolute -left-[35px] top-1 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-gold-500 sm:-left-[43px]">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                Aujourd&apos;hui
              </span>
              <h3 className="mt-1 text-lg font-bold text-slate-900">
                L&apos;Église adventiste de Bunia ville
              </h3>
              <p className="mt-1 leading-relaxed text-slate-600">
                Née d&apos;un petit groupe de familles réunies pour la prière,
                notre église de Bunia, dans la province de l&apos;Ituri, est
                portée par une communauté vivante et engagée.
                De génération en génération, Dieu a élargi nos tentes :
                aujourd&apos;hui nous accueillons de nombreux fidèles et menons
                des actions concrètes dans notre quartier. Face à cette
                croissance, nous avons compris qu&apos;une gestion rigoureuse et
                transparente des finances est un témoignage en soi — c&apos;est
                pourquoi cette plateforme de trésorerie a été conçue ici, à
                Bunia ville.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Valeurs */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
            Nos engagements
          </span>
          <h2 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Les valeurs qui guident notre service
          </h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALEURS.map((v) => (
            <div key={v.titre} className="card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <v.icone size={20} />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">{v.titre}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {v.texte}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-5 text-sm text-brand-900">
          <Scale size={18} className="mt-0.5 shrink-0 text-brand-600" />
          <p>
            Notre communauté est attachée à la défense de la liberté de
            conscience et à la séparation des Églises et de l&apos;État, dans le
            respect de l&apos;ordre public et de la dignité de la personne.
          </p>
        </div>
      </section>

      {/* Objectifs */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Nos objectifs
            </span>
            <h2 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Où nous allons ensemble
            </h2>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {OBJECTIFS.map((o) => (
              <div key={o.titre} className="card p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-700 text-white">
                  <o.icone size={22} />
                </span>
                <h3 className="mt-4 font-bold text-slate-900">{o.titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {o.texte}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-800 to-brand-600 p-8 text-center text-white sm:p-12">
          <Sparkles size={28} className="mx-auto text-gold-400" />
          <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">
            Vous voulez participer à cette vision&nbsp;?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Que ce soit par un don ponctuel, une dîme régulière ou en soutenant
            un projet précis, chaque geste compte et reçoit un reçu officiel.
          </p>
          <Link href="/offrande" className="btn btn-gold mt-6 px-7 py-3 text-base">
            <ArrowRight size={17} />
            Faire une offrande
          </Link>
        </div>
      </section>
    </div>
  );
}