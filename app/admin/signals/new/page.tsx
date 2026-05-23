import { SignalForm } from "@/components/signals/signal-form";
import { getLookupOptions } from "@/lib/data/lookups";

export default async function NewSignalPage() {
  const lookups = await getLookupOptions();

  return (
    <div className="page-shell">
      <div className="container max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3168CE]">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#0D2956]">Lisää signaali</h1>
        <SignalForm mode="create" lookups={lookups} />
      </div>
    </div>
  );
}
