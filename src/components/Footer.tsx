import Link from "next/link";
import {
  Church,
  Clock,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const RESEAUX = [
  { nom: "Facebook", initiale: "f" },
  { nom: "Instagram", initiale: "Ig" },
  { nom: "YouTube", initiale: "Yt" },
  { nom: "WhatsApp", initiale: "Wa" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-white">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
                <Church size={18} />
              </span>
              Église de Bunia
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              « Que chacun donne comme il l&apos;a résolu en son cœur. » — 2
              Corinthiens 9:7
            </p>
            <div className="mt-5 flex gap-2">
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

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link className="hover:text-white" href="/">Accueil</Link></li>
              <li><Link className="hover:text-white" href="/vision">Notre vision</Link></li>
              <li><Link className="hover:text-white" href="/projets">Projets en cours</Link></li>
              <li><Link className="hover:text-white" href="/offrande">Faire une offrande</Link></li>
              <li><Link className="hover:text-white" href="/espace">Mon espace</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Contact
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand-400" />
                <span>Avenue de la Paix n° 12, Bunia, RDC</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-brand-400" />
                <span>+243 990 000 001</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="shrink-0 text-brand-400" />
                <span>contact@eglisabunia.cd</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Cultes & horaires
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Clock size={16} className="shrink-0 text-brand-400" />
                <span>Dimanche : 9h00 — 12h00</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="shrink-0 text-brand-400" />
                <span>Mercredi : 17h30 (prière)</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="shrink-0 text-brand-400" />
                <span>Vendredi : 17h30 (réunion des jeunes)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 text-xs text-slate-500">
          © Église de Bunia — Application de gestion de la trésorerie. Tous droits
          réservés.
        </div>
      </div>
    </footer>
  );
}