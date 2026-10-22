"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChartPie,
  FolderKanban,
  Heart,
  LogOut,
  Menu,
  ReceiptText,
  Settings,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { UtilisateurPublic } from "@/lib/api";

const NAV = [
  { href: "/espace", label: "Tableau de bord", icone: ChartPie },
  { href: "/espace/dons", label: "Mes dons", icone: Heart },
  { href: "/espace/recus", label: "Mes reçus", icone: ReceiptText },
  { href: "/espace/projets", label: "Projets soutenus", icone: FolderKanban },
  { href: "/espace/parametres", label: "Mon compte", icone: Settings },
];

export default function EspaceChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChromeInterne>{children}</ChromeInterne>;
}

function ChromeInterne({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UtilisateurPublic | null>(null);
  // Le tiroir mémorise la page sur laquelle il a été ouvert : un changement
  // de route le referme donc automatiquement, sans effet ni état superflu.
  const [menuOuvertPour, setMenuOuvertPour] = useState<string | null>(null);
  const ouvert = menuOuvertPour === pathname;
  const setOuvert = (valeur: boolean) =>
    setMenuOuvertPour(valeur ? pathname : null);

  useEffect(() => {
    fetch("/api/profil")
      .then((r) => r.json())
      .then((d) => setUser(d.utilisateur ?? null))
      .catch(() => {});
  }, []);

  // Tiroir ouvert : on bloque le défilement de la page et Échap referme.
  useEffect(() => {
    if (!ouvert) return;
    const defilementInitial = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOuvertPour(null);
    };
    window.addEventListener("keydown", surTouche);
    return () => {
      document.body.style.overflow = defilementInitial;
      window.removeEventListener("keydown", surTouche);
    };
  }, [ouvert]);

  async function seDeconnecter() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <>
      {ouvert && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOuvert(false)}
          aria-hidden
        />
      )}

      <aside
        id="menu-espace"
        aria-label="Navigation de l'espace personnel"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[86vw] flex-col bg-gradient-to-b from-brand-900 to-brand-800 px-4 py-5 shadow-2xl transition-transform duration-200 lg:sticky lg:top-0 lg:bottom-auto lg:z-auto lg:h-dvh lg:w-64 lg:max-w-none lg:shrink-0 lg:self-start lg:translate-x-0 lg:shadow-none lg:transition-none ${
          ouvert ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="flex min-w-0 items-center gap-2 font-bold text-white">
              <Image
                src="/logo.jpg"
                alt="Église adventiste du septième jour — Bunia ville"
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-white/15"
              />
              <span className="min-w-0 leading-tight">
                <span className="block truncate">Église de Bunia</span>
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-brand-300">
                  Espace personnel
                </span>
              </span>
            </Link>
            <button
              onClick={() => setOuvert(false)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-brand-200 hover:bg-brand-800 hover:text-white lg:hidden"
              aria-label="Fermer le menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 rounded-xl bg-white/10 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 text-sm font-bold text-white">
                {(user?.nom ?? "?").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {user?.nom ?? "…"}
                </p>
                <p className="truncate text-xs text-brand-200">
                  {user?.role === "tresorier" ? "Trésorier" : "Donateur"}
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-5 flex-1 space-y-1">
            {NAV.map((l) => {
              const actif =
                l.href === "/espace"
                  ? pathname === "/espace"
                  : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOuvert(false)}
                  aria-current={actif ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    actif
                      ? "bg-brand-500 text-white shadow-sm"
                      : "text-slate-300 hover:bg-brand-800 hover:text-white"
                  }`}
                >
                  <l.icone size={17} className="shrink-0" />
                  <span className="truncate">{l.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-1 pt-6">
            {user?.role === "tresorier" && (
              <Link
                href="/tresorier"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-200 transition hover:bg-brand-800 hover:text-white"
              >
                <ChartPie size={17} /> Espace trésorier
              </Link>
            )}
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-200 transition hover:bg-brand-800 hover:text-white"
            >
              <ArrowLeft size={17} /> Retour au site
            </Link>
            <button
              onClick={seDeconnecter}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-brand-200 transition hover:bg-brand-800 hover:text-white"
            >
              <LogOut size={17} /> Se déconnecter
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setOuvert(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Ouvrir le menu"
              aria-expanded={ouvert}
              aria-controls="menu-espace"
            >
              <Menu size={18} />
            </button>
            <p className="hidden truncate text-sm text-slate-500 dark:text-slate-400 sm:block">
              Espace
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {" "}
                personnel
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/offrande" className="btn btn-gold btn-sm">
              <Heart size={15} /> Donner
            </Link>
            <ThemeToggle />
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white">
              {(user?.nom ?? "U").charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</main>
      </div>
    </>
  );
}
