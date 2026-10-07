"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Download,
  ExternalLink,
  Filter,
  Plus,
  Printer,
  Search,
  X,
} from "lucide-react";
import type {
  Donateur,
  Operation,
  Projet,
  TypeOffrande,
  MethodePaiement,
} from "@/lib/types";
import { LIBELLES_METHODE, LIBELLES_TYPE } from "@/lib/types";
import { formatDateCourte, formatMontant } from "@/lib/format";
import { Recu } from "@/components/Recu";
import { PrintButton } from "@/components/PrintButton";

const TAILLE_PAGE = 15;
const TYPES: TypeOffrande[] = ["dime", "offrande", "don", "aumone", "cotisation"];
const METHODES: MethodePaiement[] = ["especes", "mobile_money", "virement", "cheque"];

export default function OperationsTable() {
  return (
    <Suspense fallback={<p className="py-20 text-center text-slate-400">Chargement…</p>}>
      <Interieur />
    </Suspense>
  );
}

function Interieur() {
  const searchParams = useSearchParams();
  const initialDonateur = searchParams.get("donateurId") ?? "";

  const [operations, setOperations] = useState<Operation[] | null>(null);
  const [donateurs, setDonateurs] = useState<Donateur[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);

  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [methode, setMethode] = useState("");
  const [projetId, setProjetId] = useState("");
  const [donateurId, setDonateurId] = useState(initialDonateur);
  const [du, setDu] = useState("");
  const [au, setAu] = useState("");

  const [page, setPage] = useState(1);
  const [montrerAjout, setMontrerAjout] = useState(false);
  const [recuOp, setRecuOp] = useState<Operation | null>(null);

  function charger() {
    Promise.all([
      fetch("/api/operations").then((r) => r.json()),
      fetch("/api/donateurs").then((r) => r.json()),
      fetch("/api/projets").then((r) => r.json()),
    ])
      .then(([o, d, p]) => {
        setOperations(o.operations ?? []);
        setDonateurs(d.donateurs ?? []);
        setProjets(p.projets ?? []);
      })
      .catch(() => setOperations([]));
  }

  useEffect(charger, []);

  const filtrees = useMemo(() => {
    if (!operations) return [];
    const ql = q.trim().toLowerCase();
    let liste = operations;
    if (ql)
      liste = liste.filter(
        (o) =>
          o.donateurNom.toLowerCase().includes(ql) ||
          o.numeroRecu.toLowerCase().includes(ql) ||
          (o.note ?? "").toLowerCase().includes(ql)
      );
    if (type) liste = liste.filter((o) => o.type === type);
    if (methode) liste = liste.filter((o) => o.methode === methode);
    if (projetId) liste = liste.filter((o) => o.projetId === projetId);
    if (donateurId) liste = liste.filter((o) => o.donateurId === donateurId);
    if (du) liste = liste.filter((o) => new Date(o.date) >= new Date(du));
    if (au) {
      const fin = new Date(au);
      fin.setHours(23, 59, 59, 999);
      liste = liste.filter((o) => new Date(o.date) <= fin);
    }
    return liste;
  }, [operations, q, type, methode, projetId, donateurId, du, au]);

  const totalFiltre = filtrees.reduce((s, o) => s + o.montant, 0);
  const nbPages = Math.max(1, Math.ceil(filtrees.length / TAILLE_PAGE));
  const pageCourante = Math.min(page, nbPages);
  const visibles = filtrees.slice(
    (pageCourante - 1) * TAILLE_PAGE,
    pageCourante * TAILLE_PAGE
  );

  function reinitialiser() {
    setQ("");
    setType("");
    setMethode("");
    setProjetId("");
    setDonateurId("");
    setDu("");
    setAu("");
    setPage(1);
  }

  const filtresActifs =
    q || type || methode || projetId || donateurId || du || au;

  function exporterCsv() {
    const enTete = [
      "N° reçu",
      "Date",
      "Donateur",
      "Type",
      "Méthode",
      "Projet",
      "Montant ($)",
      "Note",
    ];
    const lignes = filtrees.map((o) => [
      o.numeroRecu,
      new Date(o.date).toISOString().slice(0, 10),
      `"${o.donateurNom}"`,
      LIBELLES_TYPE[o.type],
      LIBELLES_METHODE[o.methode],
      `"${projets.find((p) => p.id === o.projetId)?.nom ?? ""}"`,
      o.montant,
      `"${(o.note ?? "").replace(/\n/g, " ")}"`,
    ]);
    const csv = [enTete, ...lignes].map((l) => l.join(";")).join("\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `operations-${
      new Date().toISOString().slice(0, 10)
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Opérations & reçus
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtrees.length} résultat{filtrees.length > 1 ? "s" : ""} ·{" "}
            <span className="font-semibold text-brand-700">
              {formatMontant(totalFiltre)}
            </span>{" "}
            au total
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exporterCsv} className="btn btn-outline btn-sm">
            <Download size={15} /> Exporter CSV
          </button>
          <button
            onClick={() => setMontrerAjout(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={15} /> Nouvelle opération
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label className="label" htmlFor="q">Recherche</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="q"
                className="input pl-9"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Nom, n° de reçu, note…"
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="type">Type</label>
            <select
              id="type"
              className="select"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tous</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>{LIBELLES_TYPE[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="methode">Méthode</label>
            <select
              id="methode"
              className="select"
              value={methode}
              onChange={(e) => {
                setMethode(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Toutes</option>
              {METHODES.map((m) => (
                <option key={m} value={m}>{LIBELLES_METHODE[m]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="projet">Projet</label>
            <select
              id="projet"
              className="select"
              value={projetId}
              onChange={(e) => {
                setProjetId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tous</option>
              {projets.map((p) => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="donateur">Donateur</label>
            <select
              id="donateur"
              className="select"
              value={donateurId}
              onChange={(e) => {
                setDonateurId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tous</option>
              {donateurs.map((d) => (
                <option key={d.id} value={d.id}>{d.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="du">Du</label>
            <input
              id="du"
              type="date"
              className="select"
              value={du}
              onChange={(e) => {
                setDu(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div>
            <label className="label" htmlFor="au">Au</label>
            <input
              id="au"
              type="date"
              className="select"
              value={au}
              onChange={(e) => {
                setAu(e.target.value);
                setPage(1);
              }}
            />
          </div>
          {filtresActifs && (
            <button onClick={reinitialiser} className="btn btn-ghost btn-sm">
              <X size={15} /> Réinitialiser
            </button>
          )}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <Filter size={13} /> Le trésorier peut filtrer par donateur, type de
          don, méthode de paiement, projet et période.
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Date</th>
                <th>N° reçu</th>
                <th>Donateur</th>
                <th>Type</th>
                <th>Projet</th>
                <th>Méthode</th>
                <th className="text-right">Montant</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">
                    Aucune opération ne correspond aux filtres.
                  </td>
                </tr>
              ) : (
                visibles.map((o) => (
                  <tr key={o.id}>
                    <td className="whitespace-nowrap">{formatDateCourte(o.date)}</td>
                    <td className="font-mono text-xs font-semibold text-slate-500">
                      {o.numeroRecu}
                    </td>
                    <td className="font-medium text-slate-800">{o.donateurNom}</td>
                    <td>
                      <span className="chip bg-slate-100 text-slate-700">
                        {LIBELLES_TYPE[o.type]}
                      </span>
                    </td>
                    <td className="max-w-[140px] truncate text-slate-500">
                      {projets.find((p) => p.id === o.projetId)?.nom ?? "—"}
                    </td>
                    <td className="whitespace-nowrap text-slate-500">
                      {LIBELLES_METHODE[o.methode]}
                    </td>
                    <td className="text-right font-bold text-slate-900">
                      {formatMontant(o.montant)}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setRecuOp(o)}
                          className="btn btn-outline btn-sm"
                          title="Aperçu du reçu"
                        >
                          <Printer size={14} />
                          Reçu
                        </button>
                        <Link
                          href={`/recu/${o.id}`}
                          className="btn btn-ghost btn-sm"
                          title="Page d'impression"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {nbPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-500">
              Page {pageCourante} / {nbPages}
            </p>
            <div className="flex gap-1">
              <button
                disabled={pageCourante <= 1}
                onClick={() => setPage(pageCourante - 1)}
                className="btn btn-outline btn-sm"
              >
                Précédent
              </button>
              <button
                disabled={pageCourante >= nbPages}
                onClick={() => setPage(pageCourante + 1)}
                className="btn btn-outline btn-sm"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {montrerAjout && (
        <AjoutModal
          projets={projets}
          onFermer={() => setMontrerAjout(false)}
          onCree={() => {
            setMontrerAjout(false);
            charger();
          }}
        />
      )}

      {recuOp && (
        <ModalRecu
          operation={recuOp}
          nomProjet={projets.find((p) => p.id === recuOp.projetId)?.nom ?? null}
          onFermer={() => setRecuOp(null)}
        />
      )}
    </div>
  );
}

function AjoutModal({
  projets,
  onFermer,
  onCree,
}: {
  projets: Projet[];
  onFermer: () => void;
  onCree: () => void;
}) {
  const [nom, setNom] = useState("");
  const [montant, setMontant] = useState<number | "">("");
  const [type, setType] = useState<TypeOffrande>("offrande");
  const [methode, setMethode] = useState<MethodePaiement>("especes");
  const [projetId, setProjetId] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

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
          montant,
          type,
          methode,
          projetId: projetId || null,
          note,
          date: date || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.erreur ?? "Une erreur est survenue.");
        setEnCours(false);
        return;
      }
      onCree();
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
            Nouvelle opération
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
            <label className="label" htmlFor="aj-nom">Nom du donateur *</label>
            <input
              id="aj-nom"
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
              <label className="label" htmlFor="aj-montant">Montant ($) *</label>
              <input
                id="aj-montant"
                className="input"
                type="number"
                required
                min={1}
                step="any"
                value={montant}
                onChange={(e) =>
                  setMontant(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>
            <div>
              <label className="label" htmlFor="aj-date">Date</label>
              <input
                id="aj-date"
                className="input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="aj-type">Type</label>
              <select
                id="aj-type"
                className="select"
                value={type}
                onChange={(e) => setType(e.target.value as TypeOffrande)}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{LIBELLES_TYPE[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="aj-methode">Méthode</label>
              <select
                id="aj-methode"
                className="select"
                value={methode}
                onChange={(e) => setMethode(e.target.value as MethodePaiement)}
              >
                {METHODES.map((m) => (
                  <option key={m} value={m}>{LIBELLES_METHODE[m]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="aj-projet">Projet</label>
            <select
              id="aj-projet"
              className="select"
              value={projetId}
              onChange={(e) => setProjetId(e.target.value)}
            >
              <option value="">Aucun</option>
              {projets.map((p) => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="aj-note">Note</label>
            <textarea
              id="aj-note"
              className="textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
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

function ModalRecu({
  operation,
  nomProjet,
  onFermer,
}: {
  operation: Operation;
  nomProjet: string | null;
  onFermer: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
      <div className="w-full max-w-xl">
        <div className="no-print mb-3 flex items-center justify-between">
          <button onClick={onFermer} className="btn btn-ghost btn-sm text-white">
            <X size={15} /> Fermer
          </button>
          <PrintButton label="Imprimer ce reçu" />
        </div>
        <Recu operation={operation} projetNom={nomProjet} />
      </div>
    </div>
  );
}