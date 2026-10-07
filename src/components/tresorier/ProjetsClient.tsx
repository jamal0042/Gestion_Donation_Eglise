"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Rocket, TrendingUp, X } from "lucide-react";
import type { Projet, StatutProjet } from "@/lib/types";
import { LIBELLES_STATUT } from "@/lib/types";
import { formatMontant } from "@/lib/format";

const COULEURS_STATUT: Record<StatutProjet, string> = {
  en_cours: "bg-brand-100 text-brand-700",
  termine: "bg-emerald-100 text-emerald-700",
  planifie: "bg-amber-100 text-amber-700",
};

const VIDE: Omit<Projet, "id"> = {
  nom: "",
  description: "",
  objectif: 0,
  collecte: 0,
  statut: "en_cours",
  dateDebut: "",
};

export function ProjetsClient() {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [modal, setModal] = useState<null | { id?: string }>(null);
  const [cible, setCible] = useState<Omit<Projet, "id">>(VIDE);

  function charger() {
    fetch("/api/projets")
      .then((r) => r.json())
      .then((d) => setProjets(d.projets ?? []))
      .catch(() => setProjets([]));
  }

  useEffect(charger, []);

  function ouvrirNouveau() {
    setCible(VIDE);
    setModal({});
  }

  function ouvrirEdition(p: Projet) {
    setCible({
      nom: p.nom,
      description: p.description,
      objectif: p.objectif,
      collecte: p.collecte,
      statut: p.statut,
      dateDebut: p.dateDebut,
    });
    setModal({ id: p.id });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Projets</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gérez les projets de l&apos;église et leur progression financière.
          </p>
        </div>
        <button onClick={ouvrirNouveau} className="btn btn-primary btn-sm">
          <Plus size={15} /> Nouveau projet
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projets.length === 0 ? (
          <p className="md:col-span-2 xl:col-span-3 py-20 text-center text-slate-400">
            Chargement…
          </p>
        ) : (
          projets.map((p) => {
            const pct =
              p.objectif > 0
                ? Math.min(100, Math.round((p.collecte / p.objectif) * 100))
                : 0;
            return (
              <div key={p.id} className="card flex flex-col p-6">
                <div className="flex items-start justify-between gap-2">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Rocket size={20} />
                  </span>
                  <span className={`chip ${COULEURS_STATUT[p.statut]}`}>
                    {LIBELLES_STATUT[p.statut]}
                  </span>
                </div>
                <h3 className="mt-3 font-bold text-slate-900">{p.nom}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {p.description}
                </p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-brand-700">
                      {formatMontant(p.collecte)}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <TrendingUp size={14} className="text-brand-500" />
                      {pct}%
                    </span>
                  </div>
                  <div className="progress-track mt-2">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Objectif : {formatMontant(p.objectif)}
                  </p>
                </div>
                <button
                  onClick={() => ouvrirEdition(p)}
                  className="btn btn-outline btn-sm mt-5"
                >
                  <Pencil size={15} /> Modifier
                </button>
              </div>
            );
          })
        )}
      </div>

      {modal && (
        <ProjetModal
          donnees={cible}
          id={modal.id}
          onFermer={() => setModal(null)}
          onEnregistre={() => {
            setModal(null);
            charger();
          }}
        />
      )}
    </div>
  );
}

function ProjetModal({
  donnees,
  id,
  onFermer,
  onEnregistre,
}: {
  donnees: Omit<Projet, "id">;
  id?: string;
  onFermer: () => void;
  onEnregistre: () => void;
}) {
  const [form, setForm] = useState(donnees);
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  function maj<K extends keyof Omit<Projet, "id">>(cle: K, valeur: Omit<Projet, "id">[K]) {
    setForm((f) => ({ ...f, [cle]: valeur }));
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnCours(true);
    try {
      const res = await fetch("/api/projets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.erreur ?? "Une erreur est survenue.");
        setEnCours(false);
        return;
      }
      onEnregistre();
    } catch {
      setErreur("Impossible de contacter le serveur.");
      setEnCours(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <form
        onSubmit={soumettre}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {id ? "Modifier le projet" : "Nouveau projet"}
          </h2>
          <button
            type="button"
            onClick={onFermer}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="pj-nom">Nom du projet *</label>
            <input
              id="pj-nom"
              className="input"
              required
              minLength={3}
              value={form.nom}
              onChange={(e) => maj("nom", e.target.value)}
              placeholder="Ex : Construction du temple"
            />
          </div>
          <div>
            <label className="label" htmlFor="pj-desc">Description</label>
            <textarea
              id="pj-desc"
              className="textarea"
              value={form.description}
              onChange={(e) => maj("description", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="pj-obj">Objectif ($) *</label>
              <input
                id="pj-obj"
                className="input"
                type="number"
                required
                min={1}
                value={form.objectif}
                onChange={(e) => maj("objectif", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label" htmlFor="pj-collecte">Collecté ($)</label>
              <input
                id="pj-collecte"
                className="input"
                type="number"
                min={0}
                value={form.collecte}
                onChange={(e) => maj("collecte", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label" htmlFor="pj-date">Début</label>
              <input
                id="pj-date"
                className="input"
                type="date"
                value={form.dateDebut}
                onChange={(e) => maj("dateDebut", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="pj-statut">Statut</label>
            <select
              id="pj-statut"
              className="select"
              value={form.statut}
              onChange={(e) => maj("statut", e.target.value as StatutProjet)}
            >
              <option value="en_cours">En cours</option>
              <option value="planifie">Planifié</option>
              <option value="termine">Terminé</option>
            </select>
          </div>
          {erreur && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {erreur}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onFermer} className="btn btn-outline">
              Annuler
            </button>
            <button type="submit" disabled={enCours} className="btn btn-primary">
              {enCours ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}