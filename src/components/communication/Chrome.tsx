"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, FileText, LogOut, Menu, PlusCircle, Radio, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { UtilisateurPublic } from "@/lib/api";

const NAV = [
  { href: "/communication/predications", label: "Prédications", icone: Radio },
  { href: "/communication/nouveau", label: "Nouveau contenu", icone: PlusCircle },
];

export default function CommunicationChrome({ children }: { children: React.ReactNode }) {
  return <ChromeInterne>{children}</ChromeInterne>;
}

function ChromeInterne({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UtilisateurPublic | null>(null);
  const [menuOuvertPour, setMenuOuvertPour] = useState<string | null>(null);
  const ouvert = menuOuvertPour === pathname;
  const setOuvert = (valeur: boolean) => setMenuOuvertPour(valeur ? pathname : null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.utilisateur ?? null)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!ouvert) return;
    const def = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOuvertPour(null); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = def; window.removeEventListener("keydown", onKey); };
  }, [ouvert]);

  async function seDeconnecter() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <>
      {ouvert && <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden" onClick={() => setOuvert(false)} aria-hidden />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[86vw] flex-col bg-gradient-to-b from-slate-900 to-slate-800 px-4 py-5 shadow-2xl transition-transform lg:sticky lg:h-dvh lg:w-64 lg:translate-x-0 ${ouvert ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2 text-white">
              <Image src="/logo.jpg" alt="Église Adventiste du 7e jour" width={36} height={36} className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/15" />
              <span className="leading-tight">
                <span className="block">Église de Bunia</span>
                <span className="block text-[10px] uppercase tracking-widest text-slate-400">Communication</span>
              </span>
            </Link>
            <button onClick={() => setOuvert(false)} className="lg:hidden" aria-label="Fermer"><X size={18} /></button>
          </div>
          <nav className="mt-6 flex-1 space-y-1">
            {NAV.map((l) => {
              const actif = pathname.startsWith(l.href);
              return <Link key={l.href} href={l.href} onClick={() => setOuvert(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${actif ? "bg-amber-500 text-white" : "text-slate-300 hover:bg-white/10"}`}><l.icone size={17} /><span>{l.label}</span></Link>;
            })}
          </nav>
          <div className="mt-auto space-y-1 pt-6">
            <Link href="/predications" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10"><FileText size={17} /> Voir le site public</Link>
            <Link href="/espace" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10"><ArrowLeft size={17} /> Espace personnel</Link>
            <button onClick={seDeconnecter} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-white/10"><LogOut size={17} /> Se déconnecter</button>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setOuvert(true)} className="lg:hidden"><Menu size={18} /></button>
            <p className="text-sm text-slate-500">Espace <span className="font-semibold">communication</span></p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{user?.nom ?? ""}</span>
          </div>
        </header>
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </>
  );
}
