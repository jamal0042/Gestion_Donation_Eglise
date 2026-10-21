import type { Metadata } from "next";
import { Parametres } from "@/components/espace/Parametres";

export const metadata: Metadata = { title: "Mon compte" };

export default function Page() {
  return <Parametres />;
}
