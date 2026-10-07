import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import { LoginForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Connexion" };

export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-16">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-700 text-white">
          <Lock size={24} />
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
          Bon retour parmi nous
        </h1>
        <p className="mt-2 text-slate-600">
          Connectez-vous pour accéder à votre espace donateur.
        </p>
      </div>
      <div className="card mt-8 p-6 sm:p-8">
        <Suspense fallback={<p className="py-8 text-center text-slate-400">Chargement…</p>}>
          <FormulaireWrapper searchParams={searchParams} />
        </Suspense>
      </div>
      <div className="mt-6 space-y-3 text-center text-sm">
        <p className="text-slate-600">
          <Link
            href="/mot-de-passe-oublie"
            className="font-semibold text-brand-700 hover:text-brand-800"
          >
            Mot de passe oublié ?
          </Link>
        </p>
        <p className="text-slate-600">
          Pas encore de compte ?{" "}
          <Link
            href="/inscription"
            className="font-semibold text-brand-700 hover:text-brand-800"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}

async function FormulaireWrapper({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next =
    typeof params.next === "string" ? params.next : null;
  const erreur = params.erreur === "google";
  const reinitialise = params.reinitialise === "1";

  let message: string | undefined;
  if (erreur)
    message =
      "La connexion avec Google a échoué. La configuration Google n'est peut-être pas terminée — utilisez plutôt votre e-mail et mot de passe.";
  else if (reinitialise)
    message = "Votre mot de passe a été réinitialisé avec succès.";

  return <LoginForm next={next ?? "/"} erreurGlobale={message} />;
}