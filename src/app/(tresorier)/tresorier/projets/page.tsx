import type { Metadata } from "next";
import { ProjetsClient } from "@/components/tresorier/ProjetsClient";

export const metadata: Metadata = { title: "Projets" };

export default function Page() {
  return <ProjetsClient />;
}