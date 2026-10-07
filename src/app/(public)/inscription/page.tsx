import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { RegisterForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Créer un compte" };

export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col justify-center px-4 py-16">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-700 text-white">
          <UserPlus size={24} />
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
          Créer mon espace donateur
        </h1>
        <p className="mt-2 text-slate-600">
          Suivez vos dons, imprimez vos reçus et soutenez nos projets.
        </p>
      </div>
      <div className="card mt-8 p-6 sm:p-8">
        <Suspense fallback={<p className="py-8 text-center text-slate-400">Chargement…</p>}>
          <FormulaireWrapper searchParams={searchParams} />
        </Suspense>
      </div>
      <p className="mt-6 text-center text-sm text-slate-600">
        Vous avez déjà un compte ?{" "}
        <Link
          href="/connexion"
          className="font-semibold text-brand-700 hover:text-brand-800"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}

async function FormulaireWrapper({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await searchParams;
  return <RegisterForm />;
}