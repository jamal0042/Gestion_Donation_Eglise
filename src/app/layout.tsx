import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    default: "Église de Bunia — Trésorerie & Offrandes",
    template: "%s | Église de Bunia",
  },
  description:
    "Plateforme de gestion de la trésorerie, des offrandes et des projets de l'Église de Bunia : faire une offrande, suivre les projets, imprimer un reçu.",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}