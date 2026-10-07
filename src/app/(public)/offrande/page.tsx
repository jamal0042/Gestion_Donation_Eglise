import { Suspense } from "react";
import type { Metadata } from "next";
import { QrCode, ShieldCheck, Printer } from "lucide-react";
import { OffrandeForm } from "@/components/OffrandeForm";

export const metadata: Metadata = { title: "Faire une offrande" };

export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <span className="grid mx-auto h-14 w-14 place-items-center rounded-2xl bg-brand-700 text-white">
          <QrCode size={26} />
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Faire une offrande
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Aucune connexion n&apos;est requise : vous pouvez donner en toute
          confiance grâce au QR code de l&apos;église. Vous recevrez un reçu
          officiel immédiatement.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand-600" />
            Données sécurisées
          </span>
          <span className="flex items-center gap-2">
            <Printer size={16} className="text-brand-600" />
            Reçu officiel imprimable
          </span>
        </div>
      </div>

      <div className="card mt-10 p-6 sm:p-8">
        <Suspense
          fallback={<p className="py-10 text-center text-slate-400">Chargement…</p>}
        >
          <OffrandeWrapper searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function OffrandeWrapper({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const projet = typeof params.projet === "string" ? params.projet : undefined;
  return <OffrandeForm projetInitial={projet} />;
}