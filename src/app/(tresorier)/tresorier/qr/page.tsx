import type { Metadata } from "next";
import { QRGenerator } from "@/components/tresorier/QRGenerator";

export const metadata: Metadata = { title: "QR code d'offrande" };

export default function Page() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          QR code d&apos;offrande
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Générez un QR code qui permet de donner sans s&apos;authentifier.
        </p>
      </div>
      <QRGenerator />
    </div>
  );
}