import type { Metadata } from "next";
import { ProjetsSoutenus } from "@/components/espace/ProjetsSoutenus";

export const metadata: Metadata = { title: "Projets soutenus" };

export default function Page() {
  return <ProjetsSoutenus />;
}
