"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  Heart,
  Printer,
  UserRound,
} from "lucide-react";
import type { Operation, Projet, TypeOffrande, MethodePaiement } from "@/lib/types";
import { LIBELLES_METHODE, LIBELLES_TYPE } from "@/lib/types";
import { formatMontant } from "@/lib/format";

interface Props {
  projetInitial?: string;
}

const MONTANTS_RAPIDES = [5, 10, 20, 50, 100];

export function OffrandeForm({ projetInitial }: Props) {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<TypeOffrande>("offrande");
  const [montant, setMontant] = useState<number | "">("");
  const [methode, setMethode] = useState<MethodePaiement>("especes");
  const [projetId, setProjetId] = useState<string>(projetInitial ?? "");
  const [note, setNote] = useState("");
  const [creerCompte, setCreerCompte] = useState(false);
  const [emailCompte, setEmailCompte] = useState("");
  const [motDePasseCompte, setMotDePasseCompte] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");
  const [resultat, setResultat] = useState<Operation | null>(null);

  useEffect(() => {
    fetch("/api/projets")
      .then((r) => r.json())
      .then((d) => setProjets(d.projets ?? []))
      .catch(() => setProjets([]));
  }, []);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnCours(true);
    try {
      const res = await fetch("/api/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom,
          telephone,
          email,
          type,
          montant,
          methode,
          projetId: projetId || null,
          note,
          creerCompte: creerCompte
            ? { email: emailCompte, motDePasse: motDePasseCompte }
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.erreur ?? "Une erreur est survenue.");
        setEnCours(false);
        return;
      }
      setResultat(data.operation);
    } catch {
      setErreur("Impossible de contacter le serveur. Réessayez.");
      setEnCours(false);
    }
  }

  if (resultat) {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={32} />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold text-slate-900">
          Merci pour votre générosité !
        </h2>
        <p className="mt-2 text-slate-600">
          Votre contribution de{" "}
          <strong className="text-brand-700">{formatMontant(resultat.montant)}</strong> a
          bien été enregistrée.
        </p>
        <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-brand-50 px-5 py-2 font-mono text-sm font-bold text-brand-700">
          Reçu n° {resultat.numeroRecu}
        </div>
        <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3">
          <Link href={`/recu/${resultat.id}`} className="btn btn-primary w-full">
            <Printer size={17} />
            Imprimer le reçu officiel
          </Link>
          <Link href={`/espace`} className="btn btn-outline w-full">
            <UserRound size={17} />
            Voir mon espace donateur
          </Link>
          <Link href="/offrande" className="btn btn-ghost w-full">
            <Heart size={17} />
            Faire une autre offrande
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={soumettre} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="nom">Nom complet *</label>
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
        <div>
          <label className="label" htmlFor="telephone">Téléphone</label>
          <input
            id="telephone"
            className="input"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="+243 …"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="email">E-mail (optionnel, pour retrouver vos reçus)</label>
        <input
          id="email"
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.cd"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="type">Type de contribution *</label>
          <select
            id="type"
            className="select"
            value={type}
            onChange={(e) => setType(e.target.value as TypeOffrande)}
          >
            {(Object.keys(LIBELLES_TYPE) as TypeOffrande[]).map((t) => (
              <option key={t} value={t}>{LIBELLES_TYPE[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="methode">Méthode de paiement *</label>
          <select
            id="methode"
            className="select"
            value={methode}
            onChange={(e) => setMethode(e.target.value as MethodePaiement)}
          >
            {(Object.keys(LIBELLES_METHODE) as MethodePaiement[]).map((m) => (
              <option key={m} value={m}>{LIBELLES_METHODE[m]}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="montant">Montant (en $) *</label>
        <input
          id="montant"
          className="input"
          type="number"
          required
          min={1}
          step="any"
          value={montant}
          onChange={(e) =>
            setMontant(e.target.value === "" ? "" : Number(e.target.value))
          }
          placeholder="0"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {MONTANTS_RAPIDES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMontant(m)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                montant === m
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-300 text-slate-600 hover:border-brand-400"
              }`}
            >
              ${m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="projet">Projet à soutenir (optionnel)</label>
        <select
          id="projet"
          className="select"
          value={projetId}
          onChange={(e) => setProjetId(e.target.value)}
        >
          <option value="">Contribution générale</option>
          {projets
            .filter((p) => p.statut !== "termine")
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="note">Note (optionnel)</label>
        <textarea
          id="note"
          className="textarea"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex : Merci pour le culte de ce dimanche"
        />
      </div>

      <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={creerCompte}
            onChange={(e) => setCreerCompte(e.target.checked)}
            className="mt-1 h-4 w-4 accent-brand-600"
          />
          <span className="text-sm text-slate-700">
            <strong>Créer mon espace donateur</strong> — suivez vos dons,
            retrouvez vos reçus et participez aux projets. Un compte sécurisé
            sera créé pour vous.
          </span>
        </label>
        {creerCompte && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              className="input"
              type="email"
              required
              placeholder="E-mail pour votre compte *"
              value={emailCompte}
              onChange={(e) => setEmailCompte(e.target.value)}
            />
            <input
              className="input"
              type="password"
              required
              minLength={8}
              placeholder="Mot de passe (8 caractères min.) *"
              value={motDePasseCompte}
              onChange={(e) => setMotDePasseCompte(e.target.value)}
            />
          </div>
        )}
      </div>

      {erreur && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {erreur}
        </p>
      )}

      <button
        type="submit"
        disabled={enCours}
        className="btn btn-gold w-full py-3 text-base"
      >
        {enCours ? (
          "Enregistrement…"
        ) : (
          <>
            <Heart size={18} />
            Donner {typeof montant === "number" && montant > 0 ? formatMontant(montant) : ""}
          </>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
        <BadgeCheck size={14} />
        Reçu officiel remis immédiatement après votre don.
      </p>
    </form>
  );
}