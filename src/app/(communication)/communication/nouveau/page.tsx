import { getContenu } from "@/lib/store";
import FormContenu from "@/components/communication/FormContenu";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const sp = await searchParams;
  const contenu = sp.id ? await getContenu(sp.id) : null;
  return <FormContenu contenu={contenu} />;
}
