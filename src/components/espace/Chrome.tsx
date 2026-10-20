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
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    fetch("/api/profil")
      .then((r) => r.json())
      .then((d) => setUser(d.utilisateur ?? null))
      .catch(() => {});
  }, []);

  async function seDeconnecter() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <>
      {ouvert && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOuvert(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gradient-to-b from-brand-900 to-brand-800 px-4 py-6 transition-transform duration-200 lg:static lg:translate-x-0 lg:transition-none ${
          ouvert ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <Image
              src="/logo.jpg"
              alt="Église adventiste du septième jour — Bunia ville"
              width={36}
              height={36}
              className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/15"
            />
            <span className="leading-tight">
              Église de Bunia
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-brand-300">
                Espace personnel
              </span>
            </span>
          </Link>
          <button
            onClick={() => setOuvert(false)}
            className="grid h-9 w-9 place-items-center rounded-lg text-brand-200 hover:bg-brand-800 hover:text-white lg:hidden"
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 rounded-xl bg-white/10 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-sm font-bold text-white">
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

        <nav className="mt-6 space-y-1">
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
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  actif
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-slate-300 hover:bg-brand-800 hover:text-white"
                }`}
              >
                <l.icone size={17} />
                {l.label}
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
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-200 transition hover:bg-brand-800 hover:text-white"
          >
            <LogOut size={17} /> Se déconnecter
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOuvert(true)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu size={18} />
            </button>
            <p className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">
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
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white">
              {(user?.nom ?? "U").charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </>
  );
}
