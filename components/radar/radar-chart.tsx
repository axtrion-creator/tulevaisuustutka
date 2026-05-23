"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SignalCard } from "@/lib/types/signals";

const sectorOrder = ["political", "economic", "social", "technological", "environmental", "cultural"];
const horizonRadius: Record<string, number> = {
  act: 0.34,
  prepare: 0.62,
  watch: 0.88
};

const directionColor: Record<string, string> = {
  opportunity: "#17633A",
  risk: "#B42318",
  mixed: "#0A3A8F"
};

export function RadarChart({ signals }: { signals: SignalCard[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = signals.find((signal) => signal.id === activeId);

  const points = useMemo(() => {
    return signals
      .filter((signal) => signal.sectorCode && signal.horizonCode)
      .map((signal, index) => {
        const sectorIndex = Math.max(0, sectorOrder.indexOf(signal.sectorCode ?? ""));
        const sectorAngle = (sectorIndex / sectorOrder.length) * Math.PI * 2 - Math.PI / 2;
        const offset = ((index % 5) - 2) * 0.045;
        const radius = 260 * (horizonRadius[signal.horizonCode ?? "watch"] ?? 0.88) + offset * 260;
        const x = 320 + Math.cos(sectorAngle) * radius;
        const y = 320 + Math.sin(sectorAngle) * radius;
        const size = 8 + ((signal.impactScore ?? signal.relevanceScore ?? 3) * 2.2);
        const opacity = 0.45 + ((signal.confidenceScore ?? 3) / 5) * 0.45;
        const strokeWidth = (signal.noveltyScore ?? 0) >= 4 ? 4 : 2;
        return { signal, x, y, size, opacity, strokeWidth };
      });
  }, [signals]);

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="overflow-hidden rounded-lg border border-[#D8E2F0] bg-white p-3 shadow-sm">
        <svg viewBox="0 0 640 640" role="img" aria-label="Tulevaisuustutka" className="h-auto w-full">
          {[0.34, 0.62, 0.88].map((ratio) => (
            <circle key={ratio} cx="320" cy="320" r={260 * ratio} fill="none" stroke="#D8E2F0" strokeWidth="2" />
          ))}
          {sectorOrder.map((sector, index) => {
            const angle = (index / sectorOrder.length) * Math.PI * 2 - Math.PI / 2;
            const x = 320 + Math.cos(angle) * 280;
            const y = 320 + Math.sin(angle) * 280;
            const lx = 320 + Math.cos(angle) * 304;
            const ly = 320 + Math.sin(angle) * 304;
            return (
              <g key={sector}>
                <line x1="320" y1="320" x2={x} y2={y} stroke="#D8E2F0" strokeWidth="2" />
                <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="700" fill="#0D2956">
                  {sectorLabel(sector)}
                </text>
              </g>
            );
          })}
          <text x="320" y="232" textAnchor="middle" fontSize="12" fill="#607089">act</text>
          <text x="320" y="158" textAnchor="middle" fontSize="12" fill="#607089">prepare</text>
          <text x="320" y="88" textAnchor="middle" fontSize="12" fill="#607089">watch</text>
          {points.map(({ signal, x, y, size, opacity, strokeWidth }) => (
            <a key={signal.id} href={`/signals/${signal.id}`} onMouseEnter={() => setActiveId(signal.id)} onFocus={() => setActiveId(signal.id)}>
              <circle
                cx={x}
                cy={y}
                r={size}
                fill={directionColor[signal.directionCode ?? "mixed"] ?? "#0A3A8F"}
                fillOpacity={opacity}
                stroke={(signal.noveltyScore ?? 0) >= 4 ? "#0D2956" : "#FFFFFF"}
                strokeWidth={strokeWidth}
              />
            </a>
          ))}
        </svg>
      </div>

      <aside className="rounded-lg border border-[#D8E2F0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#0D2956]">Selite</h2>
        <div className="mt-4 grid gap-3 text-sm text-[#40516D]">
          <p>Sektori = PESTEC</p>
          <p>Kehä = vastehorisontti</p>
          <p>Väri = opportunity / risk / mixed</p>
          <p>Koko = impact / relevance</p>
          <p>Läpinäkyvyys = confidence</p>
          <p>Korostettu reunus = novelty</p>
        </div>
        <div className="mt-6 rounded-md bg-[#EEF3FB] p-4">
          {active ? (
            <>
              <p className="font-semibold text-[#0D2956]">{active.title}</p>
              <p className="mt-2 text-sm leading-6 text-[#607089]">{active.summary}</p>
              <Link href={`/signals/${active.id}`} className="mt-4 inline-flex text-sm font-semibold text-[#0A3A8F]">
                Avaa signaali
              </Link>
            </>
          ) : (
            <p className="text-sm leading-6 text-[#607089]">Vie osoitin pisteen päälle nähdäksesi signaalin tiivistelmän.</p>
          )}
        </div>
      </aside>
    </section>
  );
}

function sectorLabel(code: string) {
  const labels: Record<string, string> = {
    political: "P",
    economic: "E",
    social: "S",
    technological: "T",
    environmental: "E",
    cultural: "C"
  };
  return labels[code] ?? code.slice(0, 1).toUpperCase();
}
