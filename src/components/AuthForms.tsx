"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, Phone, UserRound } from "lucide-react";

function GoogleButton({ next }: { next: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        // Redirection complète obligatoire pour déclencher l'OAuth Google.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = `/api/auth/google?next=${encodeURIComponent(next)}`;
      }}
      className="btn btn-outline w-full"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
      </svg>
      Continuer avec Google
    </button>
  );
}

export function LoginForm({ next, erreurGlobale }: { next: string; erreurGlobale?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnCours(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, motDePasse }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.erreur ?? "Impossible de se connecter.");
        setEnCours(false);
        return;
      }
      router.push(next.startsWith("/") ? next : "/");
    } catch {
      setErreur("Impossible de contacter le serveur.");
      setEnCours(false);
    }
  }

  return (
    <form onSubmit={soumettre} className="space-y-4">
      {erreurGlobale && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {erreurGlobale}
        </p>
      )}
      <div>
        <label className="label" htmlFor="email">
          <span className="flex items-center gap-1.5">
            <Mail size={14} /> Adresse e-mail
          </span>
        </label>
        <input
          id="email"
          className="input"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.cd"
        />
      </div>
      <div>
        <label className="label" htmlFor="motdepasse">
          <span className="flex items-center gap-1.5">
            <KeyRound size={14} /> Mot de passe
          </span>
        </label>
        <input
          id="motdepasse"
          className="input"
          type="password"
          required
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      {erreur && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {erreur}
        </p>
      )}
      <button type="submit" disabled={enCours} className="btn btn-primary w-full">
        {enCours ? "Connexion…" : "Se connecter"}
      </button>
      <div className="relative py-1 text-center">
        <span className="bg-white px-3 text-xs uppercase tracking-widest text-slate-400">
          ou
        </span>
      </div>
      <GoogleButton next={next} />
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    if (motDePasse !== confirmation) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setEnCours(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, email, telephone, motDePasse }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.erreur ?? "Impossible de créer le compte.");
        setEnCours(false);
        return;
      }
      router.push("/espace");
    } catch {
      setErreur("Impossible de contacter le serveur.");
      setEnCours(false);
    }
  }

  return (
    <form onSubmit={soumettre} className="space-y-4">
      <div>
        <label className="label" htmlFor="nom">
          <span className="flex items-center gap-1.5">
            <UserRound size={14} /> Nom complet
          </span>
        </label>
        <input
          id="nom"
          className="input"
          required
          minLength={2}
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Ex : Jean Kabeya"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="email">
            <span className="flex items-center gap-1.5">
              <Mail size={14} /> E-mail
            </span>
          </label>
          <input
            id="email"
            className="input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.cd"
          />
        </div>
        <div>
          <label className="label" htmlFor="tel">
            <span className="flex items-center gap-1.5">
              <Phone size={14} /> Téléphone
            </span>
          </label>
          <input
            id="tel"
            className="input"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="+243 …"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="mdp">
            <span className="flex items-center gap-1.5">
              <KeyRound size={14} /> Mot de passe
            </span>
          </label>
          <input
            id="mdp"
            className="input"
            type="password"
            required
            minLength={8}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            placeholder="8 caractères min."
          />
        </div>
        <div>
          <label className="label" htmlFor="mdp2">
            <span className="flex items-center gap-1.5">
              <KeyRound size={14} /> Confirmation
            </span>
          </label>
          <input
            id="mdp2"
            className="input"
            type="password"
            required
            minLength={8}
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="Répéter le mot de passe"
          />
        </div>
      </div>
      {erreur && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {erreur}
        </p>
      )}
      <button type="submit" disabled={enCours} className="btn btn-primary w-full">
        {enCours ? "Création…" : "Créer mon compte"}
      </button>
      <div className="relative py-1 text-center">
        <span className="bg-white px-3 text-xs uppercase tracking-widest text-slate-400">
          ou
        </span>
      </div>
      <GoogleButton next="/espace" />
    </form>
  );
}

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [lien, setLien] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setEnCours(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message ?? "Vérifiez votre boîte de réception.");
      setLien(data.lien ?? null);
    } catch {
      setMessage("Impossible de contacter le serveur.");
    } finally {
      setEnCours(false);
    }
  }

  if (message) {
    return (
      <div className="space-y-4 text-center">
        <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
          {message}
        </p>
        {lien && (
          <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50/50 p-4 text-left">
            <p className="text-xs font-semibold text-brand-600">
              Serveur e-mail non configuré : voici votre lien de
              réinitialisation (en production, il est envoyé par e-mail).
            </p>
            <a
              href={lien}
              className="mt-2 block break-all font-mono text-sm font-bold text-brand-700 underline"
            >
              {lien}
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={soumettre} className="space-y-4">
      <div>
        <label className="label" htmlFor="email">
          <span className="flex items-center gap-1.5">
            <Mail size={14} /> Adresse e-mail du compte
          </span>
        </label>
        <input
          id="email"
          className="input"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.cd"
        />
      </div>
      <button type="submit" disabled={enCours} className="btn btn-primary w-full">
        {enCours ? "Envoi…" : "Envoyer le lien de réinitialisation"}
      </button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    if (motDePasse !== confirmation) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setEnCours(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, motDePasse }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.erreur ?? "Impossible de réinitialiser.");
        setEnCours(false);
        return;
      }
      router.push("/connexion?reinitialise=1");
    } catch {
      setErreur("Impossible de contacter le serveur.");
      setEnCours(false);
    }
  }

  return (
    <form onSubmit={soumettre} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="mdp">
            <span className="flex items-center gap-1.5">
              <KeyRound size={14} /> Nouveau mot de passe
            </span>
          </label>
          <input
            id="mdp"
            className="input"
            type="password"
            required
            minLength={8}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            placeholder="8 caractères min."
          />
        </div>
        <div>
          <label className="label" htmlFor="mdp2">
            <span className="flex items-center gap-1.5">
              <KeyRound size={14} /> Confirmation
            </span>
          </label>
          <input
            id="mdp2"
            className="input"
            type="password"
            required
            minLength={8}
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="Répéter le mot de passe"
          />
        </div>
      </div>
      {erreur && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {erreur}
        </p>
      )}
      <button type="submit" disabled={enCours} className="btn btn-primary w-full">
        {enCours ? "Réinitialisation…" : "Réinitialiser le mot de passe"}
      </button>
    </form>
  );
}