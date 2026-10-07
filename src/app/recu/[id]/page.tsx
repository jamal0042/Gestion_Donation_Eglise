import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BackButton, PrintButton } from "@/components/PrintButton";
import { Recu } from "@/components/Recu";
import { getOperation, getProjet } from "@/lib/store";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="no-print mx-auto mb-6 flex max-w-xl items-center justify-between">
        <BackButton />
        <PrintButton />
      </div>
      <Suspense
        fallback={
          <p className="py-16 text-center text-slate-400">Chargement du reçu…</p>
        }
      >
        <Contenu params={params} />
      </Suspense>
    </div>
  );
}

async function Contenu({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const operation = await getOperation(id);
  if (!operation) notFound();

  const projet = operation.projetId
    ? await getProjet(operation.projetId)
    : null;

  return <Recu operation={operation} projetNom={projet?.nom} />;
}