import type { Metadata } from "next";
import { DashboardClient } from "@/components/tresorier/DashboardClient";

export const metadata: Metadata = { title: "Tableau de bord — Trésorerie" };

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">
        Tableau de bord
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Vue d&apos;ensemble de la trésorerie de l&apos;église.
      </p>
      <div className="mt-6">
        <DashboardClient />
      </div>
    </div>
  );
}