import type { Metadata } from "next";
import { RecuListe } from "@/components/espace/RecuListe";

export const metadata: Metadata = { title: "Mes reçus" };

export default function Page() {
  return <RecuListe />;
}
