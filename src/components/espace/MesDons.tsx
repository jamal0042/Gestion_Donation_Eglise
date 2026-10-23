"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Download,
  ExternalLink,
  Filter,
  Printer,
  Search,
  X,
} from "lucide-react";
import type { Operation, Projet } from "@/lib/types";
import { LIBELLES_METHODE, LIBELLES_TYPE } from "@/lib/types";
import { deviseDeType, totalParDevise } from "@/lib/offrandes";
import { SelectTypeOffrande } from "@/components/SelectTypeOffrande";
import { formatDateCourte, formatMontantDevise } from "@/lib/format";

const TAILLE_PAGE = 20;

export function MesDons() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [projetId, setProjetId] = useState("");
  const [du, setDu] = useState("");
  const [au, setAu] = useState("");
  const [page, setPage] = useState(1);
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/operations?mine=1").then((r) => r.json()),
      fetch("/api/projets").then((r) => r.json()),
    ])
      .then(([o, p]) => {
        setOperations(o.operations ?? []);
        setProjets(p.projets ?? []);
      })
      .catch(() => {});
  }, []);

  const filtrees = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let liste = operations;
    if (ql)
      liste = liste.filter(
        (o) =>
          o.numeroRecu.toLowerCase().includes(ql) ||
          (o.note ?? "").toLowerCase().includes(ql)
      );
    if (type) liste = liste.filter((o) => o.type === type);
    if (projetId) liste = liste.filter((o) => o.projetId === projetId);
    if (du) liste = liste.filter((o) => new Date(o.date) >= new Date(du));
    if (au) {
      const fin = new Date(au);
      fin.setHours(23, 59, 59, 999);
      liste = liste.filter((o) => new Date(o.date) <= fin);
    }
    return liste;
  }, [operations, q, type, projetId, du, au]);

  const nbPages = Math.max(1, Math.ceil(filtrees.length / TAILLE_PAGE));
  const pageCourante = Math.min(page, nbPages);
  const visibles = filtrees.slice(
    (pageCourante - 1) * TAILLE_PAGE,
    pageCourante * TAILLE_PAGE
  );
  const totaux = useMemo(() => totalParDevise(filtrees), [filtrees]);

  function reinitialiser() {
    setQ("");
    setType("");
    setProjetId("");
    setDu("");
    setAu("");
    setPage(1);
  }

  const filtresActifs = q || type || projetId || du || au;

  const nbFiltres = [q, type, projetId, du, au].filter(Boolean).length;

  function exporterCsv() {
    const enTete = [
      "N° reçu",
      "Date",
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
      LIBELLES_TYPE[o.type],
      deviseDeType(o.type),
      LIBELLES_METHODE[o.methode],
      `"${projets.find((p) => p.id === o.projetId)?.nom ?? ""}"`,
      o.montant,
      `"${(o.note ?? "").replace(/\n/g, " ")}"`,
    ]);
    const csv = [enTete, ...lignes].map((l) => l.join(";")).join("\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `mes-dons-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl dark:text-slate-100">
            Mes dons
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {filtrees.length} don{filtrees.length > 1 ? "s" : ""} ·{" "}
            <span className="font-semibold text-brand-700 dark:text-brand-300">
              {formatMontantDevise(totaux.USD, "USD")}
            </span>{" "}
            <span className="font-semibold text-brand-700 dark:text-brand-300">
              {formatMontantDevise(totaux.CDF, "CDF")}
            </span>
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={exporterCsv} className="btn btn-outline btn-sm">
            <Download size={15} /> Exporter CSV
          </button>
          <Link href="/offrande" className="btn btn-primary btn-sm">
            + Nouveau don
          </Link>
        </div>
      </div>

      <div className="card p-4">
        <button
          type="button"
          onClick={() => setFiltresOuverts((v) => !v)}
          aria-expanded={filtresOuverts}
          aria-controls="filtres-dons"
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
          id="filtres-dons"
          className={`mt-4 gap-3 pb-1 sm:grid-cols-2 lg:mt-0 lg:grid-cols-5 ${
            filtresOuverts ? "grid" : "hidden lg:grid"
          }`}
        >
          <div className="sm:col-span-2">
            <label className="label" htmlFor="q">
              Recherche
            </label>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="q"
                className="input pl-9"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="N° de reçu, note…"
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="type">
              Type
            </label>
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
            <label className="label" htmlFor="projet">
              Projet
            </label>
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
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:col-span-2">
            <div>
              <label className="label" htmlFor="du">
                Du
              </label>
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
              <label className="label" htmlFor="au">
                Au
              </label>
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
          </div>
          {filtresActifs && (
            <div className="flex items-end">
              <button onClick={reinitialiser} className="btn btn-ghost btn-sm w-full">
                <X size={15} /> Réinitialiser
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Mobile : cartes */}
        <ul className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">
          {visibles.length === 0 ? (
            <li className="px-4 py-14 text-center text-sm text-slate-400">
              Aucun don ne correspond aux filtres.
            </li>
          ) : (
            visibles.map((o) => (
              <li key={o.id} className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {LIBELLES_TYPE[o.type]}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      {formatDateCourte(o.date)} ·{" "}
                      <span className="font-mono">{o.numeroRecu}</span>
                    </p>
                  </div>
                  <p className="tabular shrink-0 text-sm font-bold text-slate-900 dark:text-slate-100">
                    {formatMontantDevise(o.montant, deviseDeType(o.type))}
                  </p>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-xs text-slate-500 dark:text-slate-400">
                    {projets.find((p) => p.id === o.projetId)?.nom ?? "Sans projet"} ·{" "}
                    {LIBELLES_METHODE[o.methode]}
                  </p>
                  <div className="flex shrink-0 gap-1">
                    <Link
                      href={`/recu/${o.id}`}
                      className="btn btn-outline btn-sm btn-square"
                      title="Afficher le reçu"
                      aria-label={`Afficher le reçu ${o.numeroRecu}`}
                    >
                      <Printer size={14} />
                    </Link>
                    <Link
                      href={`/recu/${o.id}`}
                      className="btn btn-ghost btn-sm btn-square"
                      title="Ouvrir en plein écran"
                      aria-label={`Ouvrir le reçu ${o.numeroRecu} en plein écran`}
                      target="_blank"
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
                  <td colSpan={7} className="py-14 text-center text-slate-400">
                    Aucun don ne correspond aux filtres.
                  </td>
                </tr>
              ) : (
                visibles.map((o) => (
                  <tr key={o.id}>
                    <td className="whitespace-nowrap">
                      {formatDateCourte(o.date)}
                    </td>
                    <td className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {o.numeroRecu}
                    </td>
                    <td>
                      <span className="chip bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {LIBELLES_TYPE[o.type]}
                      </span>
                    </td>
                    <td className="max-w-[160px] truncate text-slate-500 dark:text-slate-400">
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
                        <Link
                          href={`/recu/${o.id}`}
                          className="btn btn-outline btn-sm"
                          title="Afficher le reçu"
                        >
                          <Printer size={14} />
                          Reçu
                        </Link>
                        <Link
                          href={`/recu/${o.id}`}
                          className="btn btn-ghost btn-sm btn-square"
                          title="Ouvrir en plein écran"
                          aria-label={`Ouvrir le reçu ${o.numeroRecu} en plein écran`}
                          target="_blank"
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
    </div>
  );
}
