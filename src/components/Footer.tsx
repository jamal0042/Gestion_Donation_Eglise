import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";

const RESEAUX = [
  { nom: "Facebook", initiale: "f" },
  { nom: "Instagram", initiale: "Ig" },
  { nom: "YouTube", initiale: "Yt" },
  { nom: "WhatsApp", initiale: "Wa" },
];

const NAVIGATION = [
  { label: "Accueil", href: "/" },
  { label: "Notre vision", href: "/vision" },
  { label: "Projets en cours", href: "/projets" },
  { label: "Faire une offrande", href: "/offrande" },
  { label: "Mon espace", href: "/espace" },
];

const PROGRAMME = [
  { jour: "Mardi", horaire: "6h à 6h30min" },
  { jour: "Jeudi", horaire: "6h à 7h30min" },
  { jour: "Vendredi", horaire: "17h à 18h" },
  { jour: "Samedi", horaire: "8h à 13h" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 dark:border-slate-800">
      <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.jpg"
            alt="Église adventiste du septième jour — Bunia ville"
            width={48}
            height={48}
            className="h-12 w-12 rounded-2xl object-cover ring-1 ring-white/10"
          />
          <p className="mt-4 text-base font-bold text-white">
            Église adventiste du 7<sup>e</sup> jour
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-brand-300">
            Bunia ville, Ituri
          </p>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-slate-300">
          « Que chacun donne comme il l&apos;a résolu en son cœur. » — 2
          Corinthiens 9:7
        </p>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
          Une communauté adventiste locale, attachée à la fidélité, à la
          transparence et au service de notre quartier.
        </p>

        <div className="mt-10">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">
            Culte hebdomadaire
          </h4>
          <ul className="mx-auto mt-5 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PROGRAMME.map((c) => (
              <li
                key={c.jour}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-800/70 px-4 py-3 text-sm"
              >
                <Clock size={15} className="shrink-0 text-brand-400" />
                <span className="font-semibold text-white">{c.jour} :</span>
                <span className="tabular text-slate-300">{c.horaire}</span>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-4 max-w-2xl text-sm italic leading-relaxed text-slate-400">
            Samedi : 8h à 13h — « Adorons le Seigneur avec joie en esprit et en
            vérité. »
          </p>
        </div>

        <nav
          aria-label="Navigation du pied de page"
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
        >
          {NAVIGATION.map((l) => (
            <Link
              key={l.href}
              className="text-slate-300 transition hover:text-white"
              href={l.href}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 flex justify-center gap-2">
          {RESEAUX.map((r) => (
            <a
              key={r.nom}
              href="#"
              title={r.nom}
              className="grid h-9 w-9 place-items-center rounded-lg bg-slate-800 text-xs font-bold text-slate-300 transition hover:bg-brand-600 hover:text-white"
              aria-label={r.nom}
            >
              {r.initiale}
            </a>
          ))}
        </div>

        <p className="mt-10 border-t border-slate-800 pt-6 text-xs leading-relaxed text-slate-500">
          © Église adventiste du septième jour — Bunia ville (Ituri, RDC).
          Application de gestion de la trésorerie. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
