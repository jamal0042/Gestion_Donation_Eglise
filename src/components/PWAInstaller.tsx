"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface PromptInstallation extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstaller() {
  const [prompt, setPrompt] = useState<PromptInstallation | null>(null);
  const [installe, setInstalle] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }

    function surPrompt(e: Event) {
      e.preventDefault();
      setPrompt(e as PromptInstallation);
    }
    function surInstalle() {
      setInstalle(true);
      setPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", surPrompt);
    window.addEventListener("appinstalled", surInstalle);
    return () => {
      window.removeEventListener("beforeinstallprompt", surPrompt);
      window.removeEventListener("appinstalled", surInstalle);
    };
  }, []);

  if (installe || !prompt) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-xs items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
      <Image
        src="/icons/icon-192.png"
        alt="Église de Bunia"
        width={48}
        height={48}
        className="h-12 w-12 shrink-0 rounded-xl"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900">
          Installer l&apos;application
        </p>
        <p className="text-xs text-slate-500">
          Accédez à Église de Bunia depuis votre bureau ou votre écran d&apos;accueil.
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <button onClick={() => setPrompt(null)} aria-label="Fermer" className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
        <button
          onClick={() => {
            prompt.prompt().catch(() => {});
          }}
          className="btn btn-primary btn-sm"
        >
          <Download size={14} /> Installer
        </button>
      </div>
    </div>
  );
}