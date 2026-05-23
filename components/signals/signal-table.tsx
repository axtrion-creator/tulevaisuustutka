"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SignalCard } from "@/lib/types/signals";
import { formatDate } from "@/lib/utils";

type SortKey = "updatedAt" | "impactScore" | "title";

export function SignalTable({
  signals,
  isAdmin,
  initialQuery
}: {
  signals: SignalCard[];
  isAdmin: boolean;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [sector, setSector] = useState("");
  const [horizon, setHorizon] = useState("");
  const [direction, setDirection] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");

  const sectors = unique(signals.map((signal) => signal.sectorName).filter(Boolean));
  const horizons = unique(signals.map((signal) => signal.horizonName).filter(Boolean));
  const directions = unique(signals.map((signal) => signal.directionName ?? signal.directionCode).filter(Boolean));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return signals
      .filter((signal) => {
        const matchesQuery = !q || `${signal.title} ${signal.summary}`.toLowerCase().includes(q);
        const matchesSector = !sector || signal.sectorName === sector;
        const matchesHorizon = !horizon || signal.horizonName === horizon;
        const matchesDirection = !direction || (signal.directionName ?? signal.directionCode) === direction;
        return matchesQuery && matchesSector && matchesHorizon && matchesDirection;
      })
      .sort((a, b) => {
        if (sortKey === "title") return a.title.localeCompare(b.title, "fi");
        if (sortKey === "impactScore") return (b.impactScore ?? 0) - (a.impactScore ?? 0);
        return new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime();
      });
  }, [direction, horizon, query, sector, signals, sortKey]);

  return (
    <section className="rounded-lg border border-[#D8E2F0] bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_180px_170px]">
        <input
          className="focus-ring rounded-md border border-[#B9C9E4] px-3 py-2"
          placeholder="Hae signaaleja"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Select label="PESTEC" value={sector} onChange={setSector} options={sectors} />
        <Select label="Horisontti" value={horizon} onChange={setHorizon} options={horizons} />
        <Select label="Suunta" value={direction} onChange={setDirection} options={directions} />
        <button
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-[#B9C9E4] px-3 py-2 text-sm font-semibold text-[#0D2956]"
          onClick={() => setSortKey(sortKey === "updatedAt" ? "impactScore" : sortKey === "impactScore" ? "title" : "updatedAt")}
          type="button"
        >
          <ArrowUpDown size={16} /> {sortLabel(sortKey)}
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[840px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#D8E2F0] text-xs uppercase tracking-[0.12em] text-[#607089]">
              <th className="py-3 pr-4">Signaali</th>
              <th className="px-4 py-3">PESTEC</th>
              <th className="px-4 py-3">Horisontti</th>
              <th className="px-4 py-3">Suunta</th>
              <th className="px-4 py-3">Vaikutus</th>
              <th className="px-4 py-3">Päivitetty</th>
              {isAdmin ? <th className="py-3 pl-4">Admin</th> : null}
            </tr>
          </thead>
          <tbody>
            {filtered.map((signal) => (
              <tr key={signal.id} className="border-b border-[#EEF3FB] align-top">
                <td className="py-4 pr-4">
                  <Link href={`/signals/${signal.id}`} className="font-semibold text-[#0A3A8F]">
                    {signal.title}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-[#607089]">{signal.summary}</p>
                </td>
                <td className="px-4 py-4"><Badge>{signal.sectorName ?? "-"}</Badge></td>
                <td className="px-4 py-4"><Badge tone="neutral">{signal.horizonName ?? "-"}</Badge></td>
                <td className="px-4 py-4"><Badge tone={signal.directionCode === "risk" ? "risk" : signal.directionCode === "opportunity" ? "accent" : "default"}>{signal.directionName ?? signal.directionCode ?? "-"}</Badge></td>
                <td className="px-4 py-4 font-semibold text-[#0D2956]">{signal.impactScore ?? "-"}</td>
                <td className="px-4 py-4 text-[#607089]">{formatDate(signal.updatedAt)}</td>
                {isAdmin ? (
                  <td className="py-4 pl-4">
                    <Link className="focus-ring inline-flex items-center gap-2 rounded-md border border-[#B9C9E4] px-3 py-2 font-semibold text-[#0D2956]" href={`/admin/signals/${signal.id}/edit`}>
                      <Pencil size={14} /> Muokkaa
                    </Link>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? <p className="py-8 text-center text-[#607089]">Ei hakua vastaavia signaaleja.</p> : null}
      </div>
    </section>
  );
}

function Select({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select
      aria-label={label}
      className="focus-ring rounded-md border border-[#B9C9E4] bg-white px-3 py-2"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b, "fi"));
}

function sortLabel(key: SortKey) {
  if (key === "impactScore") return "Vaikutus";
  if (key === "title") return "Otsikko";
  return "Päivitetty";
}
