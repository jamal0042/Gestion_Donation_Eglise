import type { Metadata } from "next";
import { BookOpen, Compass, HeartHandshake, HelpingHand, Target } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Notre vision" };

const VALEURS = [
  { icone: BookOpen, titre: "Fidélité", texte: "Servir Dieu avec intégrité dans la gestion des ressources qui nous sont confiées." },
  { icone: Compass, titre: "Direction divine", texte: "Toutes nos décisions financières sont prises sous la conduite du Saint-Esprit." },
  { icone: HeartHandshake, titre: "Solidarité", texte: "Nous prenons soin des veuves, des orphelins et de toute personne en détresse." },
  { icone: Target, titre: "Impact", texte: "Chaque contribution doit produire un impact visible dans la communauté." },
];

export default function Page() {
  return (
    <div>
      <section className="bg-brand-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
            À propos
          </span>
          <h1 className="mt-3 text-4xl font-extrabold">Notre vision</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-brand-100">
            Une église locale qui annonce puissamment l&apos;Évangile, disciples de
            Christ en exemple, servante de sa communauté et fidèle dans la
            gestion de tout ce que Dieu lui confie.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Notre histoire</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Fondée à Bunia, dans la province de l&apos;Ituri, notre église est née
              d&apos;un petit groupe de familles réunies pour la prière. De génération
              en génération, Dieu a élargi nos tentes : aujourd&apos;hui nous
              accueillons des centaines de fidèles chaque dimanche et menons des
              actions concrètes dans le quartier.
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              Face à la croissance, nous avons compris qu&apos;une gestion
              rigoureuse et transparente des finances est un témoignage en soi.
              C&apos;est pourquoi nous avons mis en place cet outil de trésorerie :
              chaque offrande est enregistrée, chaque reçu est délivré, chaque
              projet est suivi.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Notre mission</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Glorifier Dieu en faisant des disciples de toutes les nations,
              visiblement : annoncer l&apos;Évangile, les gens étant évangélisés,
              baptisés, enseignés et accompagnés dans la sainteté. Cela implique
              l&apos;éducation des enfants, le soutien aux plus vulnérables et la
              construction d&apos;infrastructures au service du Royaume.
            </p>
            <div className="mt-6 rounded-2xl border-l-4 border-gold-500 bg-amber-50 p-5 text-sm italic leading-relaxed text-amber-900">
              « Là où il n&apos;y a pas de vision, le peuple pérît ; mais heureux
              celui qui obéit à la loi. » — Proverbes 29:18
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-extrabold text-slate-900">Nos valeurs</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALEURS.map((v) => (
              <div key={v.titre} className="card p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <v.icone size={22} />
                </span>
                <h3 className="mt-4 font-bold text-slate-900">{v.titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.texte}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {[
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
          ].map((o) => (
            <div key={o.titre} className="card p-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-700 text-white">
                <o.icone size={22} />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">{o.titre}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{o.texte}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-gradient-to-r from-brand-800 to-brand-600 p-8 text-center text-white sm:p-12">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Vous voulez participer à cette vision&nbsp;?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Que ce soit par un don ponctuel, une dîme régulière ou en soutenant
            un projet précis, chaque geste compte.
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