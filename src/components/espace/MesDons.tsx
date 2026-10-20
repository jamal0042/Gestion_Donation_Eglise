"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  ExternalLink,
  Filter,
  Printer,
  Search,
  X,
} from "lucide-react";
import type { Operation, Projet, TypeOffrande } from "@/lib/types";
import { LIBELLES_METHODE, LIBELLES_TYPE } from "@/lib/types";
import { formatDateCourte, formatMontant } from "@/lib/format";

const TAILLE_PAGE = 20;
const TYPES: TypeOffrande[] = ["dime", "offrande", "don", "aumone", "cotisation"];

export function MesDons() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [projetId, setProjetId] = useState("");
  const [du, setDu] = useState("");
  const [au, setAu] = useState("");
  const [page, setPage] = useState(1);

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
  const totalFiltre = filtrees.reduce((s, o) => s + o.montant, 0);

  function reinitialiser() {
    setQ("");
    setType("");
    setProjetId("");
    setDu("");
    setAu("");
    setPage(1);
  }

  const filtresActifs = q || type || projetId || du || au;

  function exporterCsv() {
    const enTete = [
      "N° reçu",
      "Date",
      "Type",
      "Méthode",
      "Projet",
      "Montant ($)",
      "Note",
    ];
    const lignes = filtrees.map((o) => [
      o.numeroRecu,
      new Date(o.date).toISOString().slice(0, 10),
      LIBELLES_TYPE[o.type],
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Mes dons
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {filtrees.length} don{filtrees.length > 1 ? "s" : ""} ·{" "}
            <span className="font-semibold text-brand-700 dark:text-brand-300">
              {formatMontant(totalFiltre)}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exporterCsv} className="btn btn-outline btn-sm">
            <Download size={15} /> Exporter CSV
          </button>
          <Link href="/offrande" className="btn btn-primary btn-sm">
            + Nouveau don
          </Link>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
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
                <option key={t} value={t}>
                  {LIBELLES_TYPE[t]}
                </option>
              ))}
            </select>
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
          {filtresActifs && (
            <button onClick={reinitialiser} className="btn btn-ghost btn-sm">
              <X size={15} /> Réinitialiser
            </button>
          )}
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter size={13} /> Filtrer mes dons
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
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
                    <td className="text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatMontant(o.montant)}
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
                          className="btn btn-ghost btn-sm"
                          title="Ouvrir en plein écran"
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
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-4 py-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
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
    </div>
  );
}
