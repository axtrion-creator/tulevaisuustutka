import { RadarChart } from "@/components/radar/radar-chart";
import { getPublicSignals } from "@/lib/data/signals";

export default async function RadarPage() {
  const signals = await getPublicSignals();

  return (
    <div className="page-shell">
      <div className="container">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3168CE]">
            Tulevaisuustutka
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#0D2956]">Julkaistut signaalit tutkalla</h1>
        </div>
        <RadarChart signals={signals} />
      </div>
    </div>
  );
}
