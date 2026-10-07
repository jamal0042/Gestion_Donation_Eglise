"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";

export function PrintButton({ label = "Imprimer le reçu" }: { label?: string }) {
  return (
    <button onClick={() => window.print()} className="no-print btn btn-primary">
      <Printer size={16} />
      {label}
    </button>
  );
}

export function BackButton({
  label = "Retour",
  cible,
}: {
  label?: string;
  cible?: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => (cible ? router.push(cible) : router.back())}
      className="no-print btn btn-ghost btn-sm"
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}