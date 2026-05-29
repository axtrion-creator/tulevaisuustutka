import Link from "next/link";
import { ArrowRight, Gauge, SignalHigh } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { getDashboardStats } from "@/lib/data/dashboard";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="page-shell">
      <div className="container">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3168CE]">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#0D2956]">Signaalikannan yleiskuva</h1>
          </div>
          <Link
            href="/signals"
            className="focus-ring inline-flex w-fit items-center gap-2 rounded-md bg-[#0A3A8F] px-4 py-2 text-sm font-semibold !text-[#FFFFFF] hover:bg-[#0D2956] hover:!text-[#FFFFFF]"
          >
            Signaalitaulukko <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Julkaistut signaalit" value={stats.totalPublished} icon={<SignalHigh size={22} />} />
          <StatCard label="Uudet 30 pv" value={stats.newSignals} icon={<Gauge size={22} />} />
          <StatCard label="Korkea vaikutus" value={stats.highImpact.length} icon={<Gauge size={22} />} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Breakdown title="PESTEC" rows={stats.bySector} />
          <Breakdown title="Vastehorisontti" rows={stats.byHorizon} />
          <Breakdown title="Suunta" rows={stats.byDirection} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-[#D8E2F0] bg-white p-5">
            <h2 className="text-lg font-semibold text-[#0D2956]">Viimeksi päivitetyt</h2>
            {stats.latest.length === 0 ? (
              <EmptyState title="Ei julkaistuja signaaleja" text="Lisää julkaistuja signaaleja Supabaseen tai admin-lomakkeella." />
            ) : (
              <div className="mt-4 divide-y divide-[#E5ECF6]">
                {stats.latest.map((signal) => (
                  <Link key={signal.id} href={`/signals/${signal.id}`} className="block py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#0D2956]">{signal.title}</p>
                        <p className="mt-1 text-sm text-[#607089]">{signal.summary}</p>
                      </div>
                      <span className="shrink-0 text-xs text-[#607089]">{formatDate(signal.updatedAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-[#D8E2F0] bg-white p-5">
            <h2 className="text-lg font-semibold text-[#0D2956]">Korkean vaikutuksen signaalit</h2>
            {stats.highImpact.length === 0 ? (
              <EmptyState title="Ei korkean vaikutuksen signaaleja" text="Signaalit listataan, kun impact_score on vähintään 4." />
            ) : (
              <div className="mt-4 divide-y divide-[#E5ECF6]">
                {stats.highImpact.map((signal) => (
                  <Link key={signal.id} href={`/signals/${signal.id}`} className="block py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#0D2956]">{signal.title}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge>{signal.sectorName ?? "PESTEC puuttuu"}</Badge>
                          <Badge tone="accent">Vaikutus {signal.impactScore ?? "-"}</Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: Array<{ label: string; count: number }> }) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <section className="rounded-lg border border-[#D8E2F0] bg-white p-5">
      <h2 className="text-lg font-semibold text-[#0D2956]">{title}</h2>
      <div className="mt-4 grid gap-3">
        {rows.length === 0 ? (
          <p className="text-sm text-[#607089]">Ei dataa.</p>
        ) : (
          rows.map((row) => {
            const pct = total ? Math.round((row.count / total) * 100) : 0;
            return (
              <div key={row.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-[#0D2956]">{row.label}</span>
                  <span className="text-[#607089]">{row.count}</span>
                </div>
                <div className="h-2 rounded-full bg-[#EEF3FB]">
                  <div className="h-2 rounded-full bg-[#3168CE]" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
