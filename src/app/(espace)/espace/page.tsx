import type { Metadata } from "next";
import { TableauDeBord } from "@/components/espace/TableauDeBord";

export const metadata: Metadata = { title: "Mon espace" };

export default function Page() {
  return <TableauDeBord />;
}
