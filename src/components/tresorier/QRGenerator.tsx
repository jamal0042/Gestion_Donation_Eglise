"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, Download, Link2, Printer } from "lucide-react";
import type { Projet } from "@/lib/types";

type Mode = "accueil" | "offrande" | "projet" | "personnalise";

export function QRGenerator() {
  const [mode, setMode] = useState<Mode>("offrande");
  const [projets, setProjets] = useState<Projet[]>([]);
  const [projetId, setProjetId] = useState("");
  const [lienPerso, setLienPerso] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    fetch("/api/projets")
      .then((r) => r.json())
      .then((d) => {
        setProjets(d.projets ?? []);
        setProjetId((actuel) => actuel || d.projets?.[0]?.id || "");
      })
      .catch(() => {});
  }, []);

  const lien = useMemo(() => {
    if (typeof window === "undefined") return "";
    const base = window.location.origin;
    switch (mode) {
      case "accueil":
        return `${base}/`;
      case "offrande":
        return `${base}/offrande`;
      case "projet":
        return `${base}/offrande?projet=${encodeURIComponent(projetId || "")}`;
      case "personnalise":
        return lienPerso.trim();
    }
  }, [mode, projetId, lienPerso]);

  useEffect(() => {
    if (!lien) return;
    let actif = true;
    QRCode.toDataURL(lien, {
      width: 560,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#312e81", light: "#ffffff" },
    })
      .then((u) => {
        if (actif) setImage(u);
      })
      .catch(() => {
        if (actif) setImage(null);
      });
    return () => {
      actif = false;
    };
  }, [lien]);

  async function copier() {
    try {
      await navigator.clipboard.writeText(lien);
      setCopie(true);
      setTimeout(() => setCopie(false), 1500);
    } catch {
      setCopie(false);
    }
  }

  function imprimer() {
    const fenetre = window.open("", "_blank");
    if (!fenetre) return;
    fenetre.document.write(`
      <!doctype html><html lang="fr"><head><meta charset="utf-8"/>
      <title>QR code — ${lien}</title>
      <style>
        body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
             min-height:100vh;font-family:sans-serif;gap:16px;}
        img{width:480px;height:480px;image-rendering:pixelated;}
        p{font-size:13px;color:#334155;max-width:500px;text-align:center;word-break:break-all;}
        h2{color:#312e81;margin:0;}
        .no-print{display:none}
      </style></head>
      <body>
        <div class="no-print"><button onclick="window.print()">Imprimer</button></div>
        <h2>Église de Bunia — Faire une offrande</h2>
        <img src="${image}" alt="QR code d'offrande"/>
        <p>Scannez ce QR code pour faire une offrande à l'Église de Bunia sans créer de compte.</p>
        <p>${lien}</p>
        <script>window.onload=function(){setTimeout(function(){window.print()},400)}</script>
      </body></html>
    `);
    fenetre.document.close();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-6">
        <h2 className="font-bold text-slate-900">Configurer le QR code</h2>
        <p className="mt-1 text-sm text-slate-500">
          Générez un QR code qui mène les fidèles au formulaire d&apos;offrande,
          sans authentification.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="mode">Destination</label>
            <select
              id="mode"
              className="select"
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
            >
              <option value="offrande">Page « Faire une offrande » (général)</option>
              <option value="projet">Don fléché vers un projet</option>
              <option value="accueil">Page d&apos;accueil</option>
              <option value="personnalise">Lien personnalisé</option>
            </select>
          </div>

          {mode === "projet" && (
            <div>
              <label className="label" htmlFor="projet">Projet à soutenir</label>
              <select
                id="projet"
                className="select"
                value={projetId}
                onChange={(e) => setProjetId(e.target.value)}
              >
                {projets.length === 0 && <option value="">Chargement…</option>}
                {projets
                  .filter((p) => p.statut !== "termine")
                  .map((p) => (
                    <option key={p.id} value={p.id}>{p.nom}</option>
                  ))}
              </select>
            </div>
          )}

          {mode === "personnalise" && (
            <div>
              <label className="label" htmlFor="lienperso">Adresse du lien</label>
              <input
                id="lienperso"
                className="input"
                value={lienPerso}
                onChange={(e) => setLienPerso(e.target.value)}
                placeholder="https://…"
              />
            </div>
          )}

          <div>
            <label className="label">Lien généré</label>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
              <Link2 size={15} className="ml-1 shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-600">
                {lien || "—"}
              </span>
              <button onClick={copier} className="btn btn-outline btn-sm shrink-0">
                {copie ? <Check size={14} /> : <Copy size={14} />}
                {copie ? "Copié" : "Copier"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {image && (
              <>
                <a href={image} download="qr-offrande-eglise-bunia.png" className="btn btn-outline btn-sm">
                  <Download size={15} /> Télécharger le PNG
                </a>
                <button onClick={imprimer} className="btn btn-gold btn-sm">
                  <Printer size={15} /> Imprimer
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card flex flex-col items-center justify-center p-6">
        <h2 className="self-start font-bold text-slate-900">
          Aperçu du QR code
        </h2>
        {image ? (
          <>
            <img
              src={image}
              alt="QR code d'offrande"
              className="mt-5 h-64 w-64 rounded-xl border border-slate-200 object-contain"
            />
            <p className="mt-5 max-w-sm text-center text-sm text-slate-500">
              Affichez ce QR code à l&apos;entrée de l&apos;église, dans les
              bulletins ou sur les réseaux sociaux. Un fidèle le scanne et peut
              donner en quelques secondes, sans créer de compte.
            </p>
          </>
        ) : (
          <p className="py-16 text-slate-400">
            Configurez puis générez votre QR code.
          </p>
        )}
      </div>
    </div>
  );
}