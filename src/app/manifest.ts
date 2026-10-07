import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Église Adventiste Bunia — Gestion de la trésorerie",
    short_name: "SDA BuniaVille",
    description:
      "Gestion des offrandes, reçus et projets de l'Église de Bunia.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#312e81",
    theme_color: "#312e81",
    lang: "fr",
    dir: "ltr",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Faire une offrande",
        short_name: "Offrande",
        description: "Faire une offrande sans créer de compte",
        url: "/offrande",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Nos projets",
        short_name: "Projets",
        description: "Découvrir les projets en cours",
        url: "/projets",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}