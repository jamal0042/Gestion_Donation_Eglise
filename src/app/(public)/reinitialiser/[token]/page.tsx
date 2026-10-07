import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { ResetForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Réinitialiser le mot de passe" };

export default function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-16">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-700 text-white">
          <KeyRound size={24} />
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
          Nouveau mot de passe
        </h1>
        <p className="mt-2 text-slate-600">
          Choisissez un nouveau mot de passe pour votre compte.
        </p>
      </div>
      <div className="card mt-8 p-6 sm:p-8">
        <Suspense fallback={<p className="py-8 text-center text-slate-400">Chargement…</p>}>
          <FormulaireWrapper params={params} />
        </Suspense>
      </div>
      <p className="mt-6 text-center text-sm text-slate-600">
        <Link href="/connexion" className="font-semibold text-brand-700 hover:text-brand-800">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}

async function FormulaireWrapper({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ResetForm token={token} />;
}