import type { Metadata } from "next";
import OperationsTable from "@/components/tresorier/OperationsTable";

export const metadata: Metadata = { title: "Opérations & reçus" };

export default function Page() {
  return <OperationsTable />;
}