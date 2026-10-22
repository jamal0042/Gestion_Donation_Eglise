"use client";

import { useEffect, useState } from "react";
import {
  Lock,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { UtilisateurPublic } from "@/lib/api";

export function Parametres() {
  const [user, setUser] = useState<UtilisateurPublic | null>(null);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [enCoursProfil, setEnCoursProfil] = useState(false);
  const [msgProfil, setMsgProfil] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [enCoursEmail, setEnCoursEmail] = useState(false);
  const [msgEmail, setMsgEmail] = useState<string | null>(null);

  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [enCoursMdp, setEnCoursMdp] = useState(false);
  const [msgMdp, setMsgMdp] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profil")
      .then((r) => r.json())
      .then((d) => {
        const u = d.utilisateur ?? null;
        setUser(u);
        setNom(u?.nom ?? "");
        setTelephone(u?.telephone ?? "");
        setEmail(u?.email ?? "");
      })
      .catch(() => {});
  }, []);

  async function sauvegarderProfil(e: React.FormEvent) {
    e.preventDefault();
    setEnCoursProfil(true);
    setMsgProfil(null);
    try {
      const res = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, telephone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsgProfil(data.erreur ?? "Erreur.");
      } else {
        setMsgProfil("Profil mis à jour avec succès.");
        if (data.utilisateur) setUser(data.utilisateur);
      }
    } catch {
      setMsgProfil("Impossible de contacter le serveur.");
    } finally {
      setEnCoursProfil(false);
    }
  }

  async function changerEmail(e: React.FormEvent) {
    e.preventDefault();
    setEnCoursEmail(true);
    setMsgEmail(null);
    try {
      const res = await fetch("/api/profil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) setMsgEmail(data.erreur ?? "Erreur.");
      else setMsgEmail("Adresse e-mail mise à jour.");
    } catch {
      setMsgEmail("Impossible de contacter le serveur.");
    } finally {
      setEnCoursEmail(false);
    }
  }

  async function changerMotDePasse(e: React.FormEvent) {
    e.preventDefault();
    setMsgMdp(null);
    if (nouveauMdp !== confirmation) {
      setMsgMdp("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (nouveauMdp.length < 8) {
      setMsgMdp("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setEnCoursMdp(true);
    try {
      const res = await fetch("/api/profil/mot-de-passe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ancienMotDePasse: ancienMdp, nouveauMotDePasse: nouveauMdp }),
      });
      const data = await res.json();
      if (!res.ok) setMsgMdp(data.erreur ?? "Erreur.");
      else {
        setMsgMdp("Mot de passe modifié avec succès.");
        setAncienMdp("");
        setNouveauMdp("");
        setConfirmation("");
      }
    } catch {
      setMsgMdp("Impossible de contacter le serveur.");
    } finally {
      setEnCoursMdp(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl dark:text-slate-100">
          Mon compte
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gérez vos informations personnelles et la sécurité de votre compte.
        </p>
      </div>

      <form onSubmit={sauvegarderProfil} className="card overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <UserRound size={16} className="text-brand-600 dark:text-brand-300" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100">
              Informations personnelles
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Ces informations apparaissent sur vos reçus.
          </p>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="nom">
              Nom complet
            </label>
            <input
              id="nom"
              className="input"
              required
              minLength={2}
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="tel">
              Téléphone
            </label>
            <div className="relative">
              <Phone
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="tel"
                className="input pl-9"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="+243 …"
              />
            </div>
          </div>
          <div>
            <label className="label">Rôle</label>
            <input
              className="input"
              value={user?.role === "tresorier" ? "Trésorier" : "Donateur"}
              disabled
            />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-3">
          {msgProfil && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {msgProfil}
            </p>
          )}
          <button
            type="submit"
            disabled={enCoursProfil}
            className="btn btn-primary btn-sm ml-auto"
          >
            <Save size={15} />{" "}
            {enCoursProfil ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>

      <form onSubmit={changerEmail} className="card overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-brand-600 dark:text-brand-300" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100">
              Adresse e-mail
            </h2>
          </div>
        </div>
        <div className="p-6">
          <label className="label" htmlFor="email">
            Nouvelle adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-3">
          {msgEmail && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {msgEmail}
            </p>
          )}
          <button
            type="submit"
            disabled={enCoursEmail}
            className="btn btn-outline btn-sm ml-auto"
          >
            {enCoursEmail ? "Mise à jour…" : "Mettre à jour l'e-mail"}
          </button>
        </div>
      </form>

      <form onSubmit={changerMotDePasse} className="card overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-brand-600 dark:text-brand-300" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100">
              Sécurité & mot de passe
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Changez votre mot de passe régulièrement.
          </p>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-6">
          <div>
            <label className="label" htmlFor="old">
              Ancien mot de passe
            </label>
            <input
              id="old"
              type="password"
              className="input"
              value={ancienMdp}
              onChange={(e) => setAncienMdp(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="label" htmlFor="new">
              Nouveau mot de passe
            </label>
            <input
              id="new"
              type="password"
              className="input"
              required
              minLength={8}
              value={nouveauMdp}
              onChange={(e) => setNouveauMdp(e.target.value)}
              placeholder="8 caractères min."
            />
          </div>
          <div>
            <label className="label" htmlFor="conf">
              Confirmation
            </label>
            <input
              id="conf"
              type="password"
              className="input"
              required
              minLength={8}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Répéter"
            />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-3">
          {msgMdp && (
            <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <ShieldCheck size={14} /> {msgMdp}
            </p>
          )}
          <button
            type="submit"
            disabled={enCoursMdp}
            className="btn btn-outline btn-sm ml-auto"
          >
            {enCoursMdp ? "Modification…" : "Changer le mot de passe"}
          </button>
        </div>
      </form>
    </div>
  );
}
