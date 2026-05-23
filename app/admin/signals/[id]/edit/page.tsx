import { notFound } from "next/navigation";
import { SignalForm } from "@/components/signals/signal-form";
import { getLookupOptions } from "@/lib/data/lookups";
import { getSignalDetail } from "@/lib/data/signals";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditSignalPage({ params }: Props) {
  const { id } = await params;
  const [lookups, signal] = await Promise.all([getLookupOptions(), getSignalDetail(id, true)]);

  if (!signal) {
    notFound();
  }

  return (
    <div className="page-shell">
      <div className="container max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3168CE]">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#0D2956]">Muokkaa signaalia</h1>
        <SignalForm mode="edit" lookups={lookups} signal={signal} />
      </div>
    </div>
  );
}
