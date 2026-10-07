"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChartPie,
  Church,
  Heart,
  LogOut,
  Menu,
  QrCode,
  ReceiptText,
  Users,
  UserRound,
  FolderKanban,
  X,
} from "lucide-react";
import type { UtilisateurPublic } from "@/lib/api";

const NAV = [
  { href: "/tresorier", label: "Tableau de bord", icone: ChartPie },
  { href: "/tresorier/operations", label: "Opérations & reçus", icone: ReceiptText },
  { href: "/tresorier/donateurs", label: "Donateurs", icone: Users },
  { href: "/tresorier/projets", label: "Projets", icone: FolderKanban },
  { href: "/tresorier/qr", label: "QR code d'offrande", icone: QrCode },
];

export default function TresorierChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChromeInterne>{children}</ChromeInterne>
  );
}

function ChromeInterne({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UtilisateurPublic | null>(null);
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
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
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand-900 px-4 py-6 transition-transform duration-200 lg:static lg:translate-x-0 lg:transition-none ${
          ouvert ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white">
              <Church size={18} />
            </span>
            <span className="leading-tight">
              Église de Bunia
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-brand-300">
                Espace trésorier
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

        <nav className="mt-8 space-y-1">
          {NAV.map((l) => {
            const actif =
              l.href === "/tresorier"
                ? pathname === "/tresorier"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOuvert(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  actif
                    ? "bg-brand-500 text-white"
                    : "text-slate-300 hover:bg-brand-800 hover:text-white"
                }`}
              >
                <l.icone size={17} />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <div className="rounded-xl bg-brand-800 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
                <UserRound size={16} className="text-brand-200" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {user?.nom ?? "…"}
                </p>
                <p className="text-xs text-brand-300">Trésorier</p>
              </div>
            </div>
            <div className="mt-3 space-y-1 border-t border-white/10 pt-3">
              <Link
                href="/espace"
                className="flex items-center gap-2 text-xs text-brand-200 hover:text-white"
              >
                <Heart size={13} /> Mes dons
              </Link>
              <button
                onClick={seDeconnecter}
                className="flex w-full items-center gap-2 text-xs text-brand-200 hover:text-white"
              >
                <LogOut size={13} /> Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOuvert(true)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-700 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu size={18} />
            </button>
            <p className="hidden text-sm text-slate-500 sm:block">
              Espace
              <span className="font-semibold text-slate-800"> trésorier</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden font-semibold text-slate-700 sm:block">
              {user?.nom ?? ""}
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white">
              {(user?.nom ?? "T").charAt(0)}
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </>
  );
}