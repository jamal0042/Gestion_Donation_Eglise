import type { Metadata } from "next";
import { DonateursClient } from "@/components/tresorier/DonateursClient";

export const metadata: Metadata = { title: "Donateurs" };

export default function Page() {
  return <DonateursClient />;
}