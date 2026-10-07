import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { ForgotForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function Page() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-16">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-700 text-white">
          <KeyRound size={24} />
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
          Mot de passe oublié
        </h1>
        <p className="mt-2 text-slate-600">
          Indiquez l&apos;e-mail de votre compte : nous vous enverrons un lien
          de réinitialisation.
        </p>
      </div>
      <div className="card mt-8 p-6 sm:p-8">
        <ForgotForm />
      </div>
      <p className="mt-6 text-center text-sm text-slate-600">
        Vous vous en souvenez ?{" "}
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