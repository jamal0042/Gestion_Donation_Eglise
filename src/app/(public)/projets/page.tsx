import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProjetCards } from "@/components/ProjetCards";

export const metadata: Metadata = { title: "Projets en cours" };

export default function Page() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-800 to-brand-600 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
            Transparence
          </span>
          <h1 className="mt-3 text-4xl font-extrabold">Nos projets</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-brand-100">
            Chaque projet affiche son objectif financier et le montant déjà
            collecté. Suivez-la en temps réel et soutenez celui qui vous touche
            le plus.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ProjetCards />
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Un projet vous parle particulièrement&nbsp;?
            </h2>
            <p className="mt-1 text-slate-600">
              Vous pouvez flécher votre don vers un projet précis.
            </p>
          </div>
          <Link href="/offrande" className="btn btn-primary px-6 py-3">
            Soutenir maintenant
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}