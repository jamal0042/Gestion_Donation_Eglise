"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  function basculer() {
    const actif = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", actif ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={basculer}
      aria-label="Basculer entre le mode clair et le mode sombre"
      title="Mode clair / sombre"
      className={`group relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-400 dark:hover:text-brand-300 ${className}`}
    >
      <Sun
        size={18}
        className="absolute rotate-0 scale-0 opacity-0 transition-all duration-300 dark:rotate-0 dark:scale-100 dark:opacity-100"
      />
      <Moon
        size={18}
        className="absolute rotate-0 scale-100 opacity-100 transition-all duration-300 dark:rotate-90 dark:scale-0 dark:opacity-0"
      />
    </button>
  );
}
