import Link from "next/link";
import {
  ArrowRight,
  Eye,
  Gift,
  Heart,
  HeartHandshake,
  Landmark,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { StatsBandeau } from "@/components/StatsBandeau";
import { ProjetCards } from "@/components/ProjetCards";

export default function Page() {
  return (
    <div>
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-gold-500/20 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-100">
              <Sparkles size={14} /> Gestion transparente de la trésorerie
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">
              Donner avec joie,{" "}
              <span className="text-gold-400">avec transparence</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-100">
              L&apos;Église adventiste du septième jour de Bunia ville
              centralise la collecte des dîmes, offrandes et dons. Chaque
              contribution reçoit un reçu officiel, chaque projet avance sous le
              regard de la communauté.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/offrande" className="btn btn-gold px-6 py-3 text-base">
                <Heart size={18} />
                Faire une offrande
              </Link>
              <Link
                href="/projets"
                className="btn border border-white/30 bg-white/10 px-6 py-3 text-base text-white hover:bg-white/20"
              >
                Voir les projets
                <ArrowRight size={17} />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-100">
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-gold-400" />
                Reçu officiel imprimable
              </span>
              <span className="flex items-center gap-2">
                <QrCode size={16} className="text-gold-400" />
                Don rapide via QR code
              </span>
              <span className="flex items-center gap-2">
                <Eye size={16} className="text-gold-400" />
                Suivi des projets en temps réel
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <StatsBandeau />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Notre mission
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
              Une église qui rend visible ce que Dieu confie
            </h2>
            <p className="mt-5 leading-relaxed text-slate-600">
              Notre mission est d&apos;honorer Dieu par une gestion
              responsable des ressources qui Lui sont confiées. Chaque dollar
              est enregistré, reçu et affecté à un objectif précis : bâtir,
              enseigner, secourir et annoncer l&apos;Évangile.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {[
                {
                  icone: Landmark,
                  titre: "Foi",
                  texte: "Servir Dieu par la générosité du cœur.",
                },
                {
                  icone: Eye,
                  titre: "Transparence",
                  texte: "Chaque contribution est traçable.",
                },
                {
                  icone: HeartHandshake,
                  titre: "Solidarité",
                  texte: "Nul ne porte seul son fardeau.",
                },
              ].map((v) => (
                <div key={v.titre} className="card p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <v.icone size={20} />
                  </span>
                  <h3 className="mt-3 font-bold text-slate-900">{v.titre}</h3>
                  <p className="mt-1 text-sm text-slate-600">{v.texte}</p>
                </div>
              ))}
            </div>
            <Link
              href="/vision"
              className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Découvrir notre vision complète
              <ArrowRight size={15} />
            </Link>
          </div>

          <div>
            <div className="card overflow-hidden">
              <div className="bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white">
                <QrCode size={36} className="text-gold-400" />
                <h3 className="mt-4 text-xl font-bold">Donnez en 30 secondes</h3>
                <ul className="mt-4 space-y-3 text-sm text-brand-100">
                  <li className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15 font-bold">
                      1
                    </span>
                    Scannez le QR code affiché à l&apos;église ou suivez le lien
                  </li>
                  <li className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15 font-bold">
                      2
                    </span>
                    Indiquez votre nom, le type et le montant
                  </li>
                  <li className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15 font-bold">
                      3
                    </span>
                    Recevez immédiatement votre reçu officiel
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-between gap-3 bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Printer size={16} className="text-brand-600" />
                  Reçu officiel imprimable
                </div>
                <Link href="/offrande" className="btn btn-primary btn-sm">
                  <Gift size={15} />
                  Je donne
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
                Projets en cours
              </span>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
                Ce que la communauté construit ensemble
              </h2>
            </div>
            <Link
              href="/projets"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Tous les projets
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className="mt-9">
            <ProjetCards limite={3} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              nom: "Jean K.",
              texte:
                "Je peux maintenant suivre mes dîmes et recevoir un reçu pour chaque don. C'est un vrai changement dans la confiance.",
            },
            {
              nom: "Maman Alice",
              texte:
                "Le QR code à la sortie du culte est très pratique. J'ai fait mon don en une minute, sans faire la queue.",
            },
            {
              nom: "Comité des jeunes",
              texte:
                "Nous savons exactement où va l'argent des cotisations grâce au tableau de bord transparent de l'église.",
            },
          ].map((t) => (
            <blockquote key={t.nom} className="card p-6">
              <div className="flex gap-1 text-gold-500" aria-label="5 étoiles">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
              <p className="mt-3 text-slate-600">&laquo; {t.texte} &raquo;</p>
              <footer className="mt-4 text-sm font-bold text-slate-900">
                — {t.nom}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-brand-800 to-brand-600 py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              Prêt à bâtir avec nous ?
            </h2>
            <p className="mt-2 text-brand-100">
              Rejoignez les parents donateurs de l&apos;Église de Bunia.
            </p>
          </div>
          <Link href="/inscription" className="btn btn-gold px-7 py-3 text-base">
            <Heart size={18} />
            Créer mon espace
          </Link>
        </div>
      </section>
    </div>
  );
}