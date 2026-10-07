import type { Metadata } from "next";
import { EspaceClient } from "@/components/EspaceClient";

export const metadata: Metadata = { title: "Mon espace donateur" };

export default function Page() {
  return <EspaceClient />;
}