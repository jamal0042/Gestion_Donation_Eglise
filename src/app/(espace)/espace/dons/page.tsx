import type { Metadata } from "next";
import { MesDons } from "@/components/espace/MesDons";

export const metadata: Metadata = { title: "Mes dons" };

export default function Page() {
  return <MesDons />;
}
