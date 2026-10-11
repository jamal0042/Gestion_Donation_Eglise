"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Heart,
  LogOut,
  Menu,
  LayoutDashboard,
  UserRound,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { UtilisateurPublic } from "@/lib/api";

const LIENS = [
  { href: "/", label: "Accueil" },
  { href: "/vision", label: "Notre vision" },
  { href: "/projets", label: "Projets" },
];

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UtilisateurPublic | null>(null);
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.utilisateur ?? null))
      .catch(() => setUser(null));
  }, []);

  async function seDeconnecter() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  const lienUser =
    user?.role === "tresorier" ? "/tresorier" : "/espace";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
          <Image
            src="/logo.jpg"
            alt="Église adventiste du septième jour — Bunia ville"
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl object-cover ring-1 ring-black/5 dark:ring-white/10"
          />
          <span className="leading-tight">
            Église Adventiste du 7<sup>e</sup> jour
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-300">
              Bunia ville
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LIENS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-700 dark:hover:text-brand-300"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/offrande" className="btn btn-gold btn-sm md:btn">
            <Heart size={16} />
            Faire une offrande
          </Link>

          {user ? (
            <div className="flex items-center gap-1">
              <Link
                href={lienUser}
                className="btn btn-outline btn-sm"
              >
                <UserRound size={16} />
                {user.role === "tresorier" ? (
                  <>
                    <LayoutDashboard size={15} className="text-brand-600 dark:text-brand-300" />
                    Trésorerie
                  </>
                ) : (
                  "Mon espace"
                )}
              </Link>
              <button
                onClick={seDeconnecter}
                title="Se déconnecter"
                className="btn btn-ghost btn-sm"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <>
              <Link href="/connexion" className="btn btn-ghost btn-sm">
                Connexion
              </Link>
              <Link href="/inscription" className="btn btn-outline btn-sm">
                Créer un compte
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOuvert((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            aria-label="Menu"
          >
            {ouvert ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {ouvert && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {LIENS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOuvert(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/offrande"
              onClick={() => setOuvert(false)}
              className="btn btn-gold"
            >
              <Heart size={16} />
              Faire une offrande
            </Link>
            {user ? (
              <button
                onClick={() => {
                  setOuvert(false);
                  seDeconnecter();
                }}
                className="btn btn-outline"
              >
                <LogOut size={16} /> Se déconnecter
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/connexion"
                  onClick={() => setOuvert(false)}
                  className="btn btn-outline"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  onClick={() => setOuvert(false)}
                  className="btn btn-primary"
                >
                  Créer un compte
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}