import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin } from "lucide-react";

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
      {/* Sur mobile : tout est centré. Sur écran large : colonnes alignées à gauche. */}
      <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 md:text-left lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Marque */}
          <div>
            <div className="flex flex-col items-center md:flex-row md:items-start md:gap-2">
              <Image
                src="/logo.jpg"
                alt="Église adventiste du septième jour — Bunia ville"
                width={40}
                height={40}
                className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10"
              />
              <span className="mt-2 leading-tight md:mt-0">
                Église adventiste du 7<sup>e</sup> jour
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-brand-300">
                  Bunia ville, Ituri
                </span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              « Que chacun donne comme il l&apos;a résolu en son cœur. » — 2
              Corinthiens 9:7
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Une communauté adventiste locale, attachée à la fidélité, à la
              transparence et au service de notre quartier.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              {NAVIGATION.map((l) => (
                <li key={l.href}>
                  <Link className="transition hover:text-white" href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Contact
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start justify-center gap-2 md:justify-start">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand-400" />
                <span>
                  Église adventiste du septième jour
                  <br />
                  Bunia ville, Ituri (RDC)
                </span>
              </li>
            </ul>
            <div className="mt-5 flex justify-center gap-2 md:justify-start">
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
          </div>

          {/* Programme des cultes */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Culte hebdomadaire
            </h4>
            <ul className="mx-auto mt-4 max-w-sm space-y-2.5 text-sm md:mx-0 md:max-w-none">
              {PROGRAMME.map((c) => (
                <li
                  key={c.jour}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-800/70 px-4 py-2.5 md:justify-start md:rounded-none md:bg-transparent md:px-0 md:py-1"
                >
                  <Clock size={15} className="shrink-0 text-brand-400" />
                  <span className="font-semibold text-white">{c.jour} :</span>
                  <span className="tabular text-slate-300">{c.horaire}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm italic leading-relaxed text-slate-400">
              Samedi : 8h à 13h — « Adorons le Seigneur avec joie en esprit et en
              vérité. »
            </p>
          </div>
        </div>

        <p className="mt-12 border-t border-slate-800 pt-6 text-xs leading-relaxed text-slate-500">
          © Église adventiste du septième jour — Bunia ville (Ituri, RDC).
          Application de gestion de la trésorerie. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
