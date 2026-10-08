import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PWAInstaller } from "@/components/PWAInstaller";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Église adventiste du septième jour — Bunia ville | Trésorerie & Offrandes",
    template: "%s | Église adventiste du septième jour — Bunia",
  },
  description:
    "Église adventiste du septième jour — Bunia ville (Ituri, RDC). Plateforme de gestion des dîmes, offrandes, dons et projets : faire un don en ligne, obtenir un reçu officiel, suivre les projets.",
  applicationName: "Église adventiste du septième jour — Bunia ville",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EASJ Bunia ville",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        url: "/icons/apple-splash-1290x2796.png",
        sizes: "1290x2796",
        type: "image/png",
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/icons/apple-splash-1179x2556.png",
        sizes: "1179x2556",
        type: "image/png",
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/icons/apple-splash-1170x2532.png",
        sizes: "1170x2532",
        type: "image/png",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/icons/apple-splash-1668x2388.png",
        sizes: "1668x2388",
        type: "image/png",
        media:
          "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/apple-splash-1620x2160.png",
        sizes: "1620x2160",
        type: "image/png",
        media:
          "(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#312e81",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <PWAInstaller />
      </body>
    </html>
  );
}