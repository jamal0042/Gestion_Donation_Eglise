"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
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
import { deviseDeType, totalParDevise } from "@/lib/offrandes";
import { SelectTypeOffrande } from "@/components/SelectTypeOffrande";
import { formatDateCourte, formatMontantDevise } from "@/lib/format";
import { Recu } from "@/components/Recu";
import { PrintButton } from "@/components/PrintButton";

const TAILLE_PAGE = 15;
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
  const [filtresOuverts, setFiltresOuverts] = useState(false);

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

  const totaux = useMemo(() => totalParDevise(filtrees), [filtrees]);
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

  const nbFiltres = [
    q,
    type,
    methode,
    projetId,
    donateurId,
    du,
    au,
  ].filter(Boolean).length;

  function exporterCsv() {
    const enTete = [
      "N° reçu",
      "Date",
      "Donateur",
      "Type",
      "Devise",
      "Méthode",
      "Projet",
      "Montant",
      "Note",
    ];
    const lignes = filtrees.map((o) => [
      o.numeroRecu,
      new Date(o.date).toISOString().slice(0, 10),
      `"${o.donateurNom}"`,
      LIBELLES_TYPE[o.type],
      deviseDeType(o.type),
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
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl dark:text-slate-100">
            Opérations & reçus
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {filtrees.length} résultat{filtrees.length > 1 ? "s" : ""} ·{" "}
            <span className="font-semibold text-brand-700 dark:text-brand-300">
              {formatMontantDevise(totaux.USD, "USD")}
            </span>{" "}
            <span className="font-semibold text-brand-700 dark:text-brand-300">
              {formatMontantDevise(totaux.CDF, "CDF")}
            </span>{" "}
            au total
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
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
        <button
          type="button"
          onClick={() => setFiltresOuverts((v) => !v)}
          aria-expanded={filtresOuverts}
          aria-controls="filtres-operations"
          className="btn btn-outline btn-sm w-full justify-between lg:hidden"
        >
          <span className="flex items-center gap-2">
            <Filter size={15} /> Filtres
            {nbFiltres > 0 && (
              <span className="chip bg-brand-100 text-brand-700 dark:bg-brand-500/25 dark:text-brand-300">
                {nbFiltres}
              </span>
            )}
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform ${filtresOuverts ? "rotate-180" : ""}`}
          />
        </button>

        <div
          id="filtres-operations"
          className={`mt-4 gap-3 pb-1 sm:grid-cols-2 lg:mt-0 lg:grid-cols-4 xl:grid-cols-5 ${
            filtresOuverts ? "grid" : "hidden lg:grid"
          }`}
        >
          <div className="sm:col-span-2">
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
            <SelectTypeOffrande
              id="type"
              value={type}
              onChange={(code) => {
                setType(code);
                setPage(1);
              }}
              placeholder="Tous"
            />
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
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <button onClick={reinitialiser} className="btn btn-ghost btn-sm w-full">
                <X size={15} /> Réinitialiser
              </button>
            </div>
          )}
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-400">
          <Filter size={13} className="mt-0.5 shrink-0" /> Le trésorier peut filtrer par
          donateur, type de don, méthode de paiement, projet et période.
        </p>
      </div>

      <div className="card overflow-hidden">
        {/* Mobile : cartes */}
        <ul className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">
          {visibles.length === 0 ? (
            <li className="px-4 py-14 text-center text-sm text-slate-400">
              Aucune opération ne correspond aux filtres.
            </li>
          ) : (
            visibles.map((o) => (
              <li key={o.id} className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {o.donateurNom}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      {formatDateCourte(o.date)} ·{" "}
                      <span className="font-mono">{o.numeroRecu}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tabular text-sm font-bold text-slate-900 dark:text-slate-100">
                      {formatMontantDevise(o.montant, deviseDeType(o.type))}
                    </p>
                    <span className="chip mt-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {LIBELLES_TYPE[o.type]}
                    </span>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-xs text-slate-500 dark:text-slate-400">
                    {projets.find((p) => p.id === o.projetId)?.nom ?? "Sans projet"} ·{" "}
                    {LIBELLES_METHODE[o.methode]}
                  </p>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => setRecuOp(o)}
                      className="btn btn-outline btn-sm btn-square"
                      title="Aperçu du reçu"
                      aria-label={`Aperçu du reçu ${o.numeroRecu}`}
                    >
                      <Printer size={14} />
                    </button>
                    <Link
                      href={`/recu/${o.id}`}
                      className="btn btn-ghost btn-sm btn-square"
                      title="Page d'impression"
                      aria-label={`Ouvrir le reçu ${o.numeroRecu}`}
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>

        {/* Ordinateur : tableau */}
        <div className="scroll-x hidden md:block">
          <table className="table-base min-w-[720px]">
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
                    <td className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {o.numeroRecu}
                    </td>
                    <td className="max-w-[200px] truncate font-medium text-slate-800 dark:text-slate-200">
                      {o.donateurNom}
                    </td>
                    <td>
                      <span className="chip bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {LIBELLES_TYPE[o.type]}
                      </span>
                    </td>
                    <td className="max-w-[140px] truncate text-slate-500 dark:text-slate-400">
                      {projets.find((p) => p.id === o.projetId)?.nom ?? "—"}
                    </td>
                    <td className="whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {LIBELLES_METHODE[o.methode]}
                    </td>
                    <td className="tabular text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatMontantDevise(o.montant, deviseDeType(o.type))}
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
                          className="btn btn-ghost btn-sm btn-square"
                          title="Page d'impression"
                          aria-label={`Ouvrir le reçu ${o.numeroRecu}`}
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
          <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Page {pageCourante} / {nbPages}
            </p>
            <div className="flex gap-1">
              <button
                disabled={pageCourante <= 1}
                onClick={() => setPage(pageCourante - 1)}
                className="btn btn-outline btn-sm flex-1 sm:flex-none"
              >
                Précédent
              </button>
              <button
                disabled={pageCourante >= nbPages}
                onClick={() => setPage(pageCourante + 1)}
                className="btn btn-outline btn-sm flex-1 sm:flex-none"
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

  const devise = deviseDeType(type);

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
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Nouvelle opération
          </h2>
          <button
            type="button"
            onClick={onFermer}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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
              <label className="label" htmlFor="aj-montant">Montant (en {devise}) *</label>
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
              <SelectTypeOffrande
                id="aj-type"
                value={type}
                onChange={(code) => setType(code as TypeOffrande)}
              />
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
            <p className="rounded-lg bg-red-50 dark:bg-red-500/15 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
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