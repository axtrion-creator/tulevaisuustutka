"use client";

import Link from "next/link";
import { ChevronDown, Info, Minus, Plus, RotateCcw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { SignalCard } from "@/lib/types/signals";

const sectorOrder = ["political", "economic", "social", "technological", "environmental", "cultural"];
const horizonRadius: Record<string, number> = {
  act: 0.34,
  prepare: 0.62,
  watch: 0.88
};

const directionColor: Record<string, string> = {
  opportunity: "#2EA66F",
  risk: "#F05A28",
  mixed: "#1F63C6"
};

const filters = [
  { code: "all", label: "Kaikki", kind: "all" },
  { code: "act", label: "Act (0-12 kk)", kind: "horizon" },
  { code: "prepare", label: "Prepare (1-3 v)", kind: "horizon" },
  { code: "watch", label: "Watch (> 3 v)", kind: "horizon" },
  { code: "opportunity", label: "Opportunity", kind: "direction" },
  { code: "risk", label: "Risk", kind: "direction" },
  { code: "mixed", label: "Mixed", kind: "direction" }
] as const;

type FilterCode = (typeof filters)[number]["code"];

export function RadarChart({ signals }: { signals: SignalCard[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterCode>("all");
  const [zoom, setZoom] = useState(1);

  const filteredSignals = useMemo(() => {
    return signals.filter((signal) => matchesFilter(signal, filter));
  }, [filter, signals]);

  const points = useMemo(() => {
    return filteredSignals
      .filter((signal) => signal.sectorCode && signal.horizonCode)
      .map((signal, index) => {
        const sectorIndex = sectorIndexFor(signal, index);
        const sectorAngle = (sectorIndex / sectorOrder.length) * Math.PI * 2 - Math.PI / 2;
        const spread = (seed(signal.id, 7) - 0.5) * (Math.PI / sectorOrder.length) * 0.72;
        const radiusJitter = (seed(signal.id, 13) - 0.5) * 34;
        const radius = 266 * (horizonRadius[normalizeCode(signal.horizonCode) ?? "watch"] ?? 0.88) + radiusJitter;
        const angle = sectorAngle + spread;
        const x = 360 + Math.cos(angle) * radius;
        const y = 360 + Math.sin(angle) * radius;
        const score = signal.impactScore ?? signal.relevanceScore ?? 3;
        const size = 6 + score * 2.8;
        const opacity = 0.58 + ((signal.confidenceScore ?? 3) / 5) * 0.34;
        const highNovelty = (signal.noveltyScore ?? 0) >= 4;
        const labelAnchor: "start" | "end" = x > 360 ? "start" : "end";
        return { signal, x, y, size, opacity, highNovelty, labelAnchor };
      });
  }, [filteredSignals]);

  const active = filteredSignals.find((signal) => signal.id === activeId);
  const activePoint = points.find((point) => point.signal.id === activeId);

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_376px]">
      <div className="min-w-0">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl text-sm leading-6 text-[#40516D]">
            Tutka näyttää julkaistut signaalit PESTEC-sektoreittain ja vastehorisontin mukaan.
            <br />
            Klikkaa signaalia nähdäksesi lisätiedot.
          </div>
          <label className="grid w-full max-w-[280px] gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#526684]">
            Näytä
            <span className="relative block">
              <select
                aria-label="Suodata tutkaa"
                value={filter}
                onChange={(event) => changeFilter(event.target.value as FilterCode)}
                className="focus-ring w-full appearance-none rounded-md border border-[#C9D8EE] bg-white px-4 py-3 pr-10 text-sm font-semibold normal-case tracking-normal text-[#0A3A8F] shadow-sm"
              >
                {filters.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0A3A8F]" />
            </span>
          </label>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-[#D8E2F0] bg-white p-4 shadow-[0_18px_45px_rgba(13,41,86,0.08)] md:p-6">
          <div className="absolute left-5 top-5 z-10 rounded-md bg-[#F3F7FD] px-4 py-4 text-[#0A3A8F] shadow-sm md:left-6 md:top-6 md:px-5">
            <p className="text-3xl font-semibold leading-none">{filteredSignals.length}</p>
            <p className="mt-2 text-xs font-semibold leading-5">
              julkaistua
              <br />
              signaalia
            </p>
          </div>

          <svg viewBox="0 0 720 720" role="img" aria-label="Tulevaisuustutka" className="mx-auto block aspect-square w-full max-w-[820px]">
            <g transform={`translate(360 360) scale(${zoom}) translate(-360 -360)`}>
              {[0.34, 0.62, 0.88].map((ratio) => (
                <circle key={ratio} cx="360" cy="360" r={266 * ratio} fill="none" stroke="#C9D8EE" strokeWidth="1.6" />
              ))}

              {sectorOrder.map((sector, index) => {
                const angle = (index / sectorOrder.length) * Math.PI * 2 - Math.PI / 2;
                const lineX = 360 + Math.cos(angle) * 300;
                const lineY = 360 + Math.sin(angle) * 300;
                const labelX = 360 + Math.cos(angle) * 338;
                const labelY = 360 + Math.sin(angle) * 338;
                const label = sectorLabel(sector);
                return (
                  <g key={sector}>
                    <line x1="360" y1="360" x2={lineX} y2={lineY} stroke="#C9D8EE" strokeWidth="1.4" />
                    <text x={labelX} y={labelY - 9} textAnchor="middle" fontSize="20" fontWeight="800" fill="#0A3A8F">
                      {label.short}
                    </text>
                    <text x={labelX} y={labelY + 14} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0D2956">
                      {label.long}
                    </text>
                  </g>
                );
              })}

              {[
                { code: "watch", label: "watch", sub: "> 3 vuotta", y: 126 },
                { code: "prepare", label: "prepare", sub: "1-3 vuotta", y: 214 },
                { code: "act", label: "act", sub: "0-12 kk", y: 304 }
              ].map((item) => (
                <g key={item.code}>
                  <rect x="318" y={item.y - 21} width="84" height="48" rx="6" fill="#F1F5FB" />
                  <text x="360" y={item.y - 2} textAnchor="middle" fontSize="12" fontWeight="800" fill="#0A3A8F">
                    {item.label}
                  </text>
                  <text x="360" y={item.y + 16} textAnchor="middle" fontSize="11" fill="#0D2956">
                    {item.sub}
                  </text>
                </g>
              ))}

              {points.map(({ signal, x, y, size, opacity, highNovelty, labelAnchor }) => (
                <g
                  key={signal.id}
                  role="link"
                  tabIndex={0}
                  className="cursor-pointer"
                  onClick={() => {
                    window.location.href = `/signals/${signal.id}`;
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      window.location.href = `/signals/${signal.id}`;
                    }
                  }}
                  onPointerEnter={() => setActiveId(signal.id)}
                  onFocus={() => setActiveId(signal.id)}
                  onPointerLeave={() => setActiveId(null)}
                  onBlur={() => setActiveId(null)}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={size}
                    fill={directionColor[normalizeCode(signal.directionCode) ?? "mixed"] ?? directionColor.mixed}
                    fillOpacity={opacity}
                    stroke={highNovelty ? "#0D2956" : "#FFFFFF"}
                    strokeWidth={highNovelty ? 3 : 1.5}
                  />
                  <text
                    x={labelAnchor === "start" ? x + size + 6 : x - size - 6}
                    y={y + 4}
                    textAnchor={labelAnchor}
                    fontSize="9.5"
                    fontWeight="700"
                    fill="#0D2956"
                  >
                    {truncate(signal.title, 22)}
                  </text>
                </g>
              ))}
            </g>
          </svg>

          {active && activePoint ? (
            <div
              className="pointer-events-none absolute z-20 max-w-[280px] rounded-md border border-[#C9D8EE] bg-white p-4 text-sm shadow-[0_18px_45px_rgba(13,41,86,0.16)]"
              style={{
                left: `min(calc(100% - 300px), max(16px, ${(activePoint.x / 720) * 100}%))`,
                top: `min(calc(100% - 180px), max(16px, ${(activePoint.y / 720) * 100}%))`
              }}
            >
              <p className="font-semibold text-[#0D2956]">{active.title}</p>
              <p className="mt-2 line-clamp-4 leading-6 text-[#40516D]">{active.summary}</p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => document.getElementById("radar-guide")?.scrollIntoView({ behavior: "smooth", block: "nearest" })}
            className="focus-ring absolute bottom-6 left-5 inline-flex items-center gap-2 rounded-md border border-[#C9D8EE] bg-white px-4 py-3 text-sm font-semibold text-[#0D2956] shadow-sm md:left-6"
          >
            <Info size={18} /> Näytä ohje
          </button>

          <div className="absolute bottom-6 right-5 inline-flex overflow-hidden rounded-md border border-[#C9D8EE] bg-white shadow-sm md:right-6">
            <button
              type="button"
              aria-label="Pienennä tutkaa"
              onClick={() => setZoom((value) => Math.max(0.8, Number((value - 0.1).toFixed(1))))}
              className="focus-ring grid h-10 w-11 place-items-center text-[#0A3A8F]"
            >
              <Minus size={18} />
            </button>
            <button
              type="button"
              aria-label="Suurenna tutkaa"
              onClick={() => setZoom((value) => Math.min(1.2, Number((value + 0.1).toFixed(1))))}
              className="focus-ring grid h-10 w-11 place-items-center border-l border-[#C9D8EE] text-[#0A3A8F]"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>

      <aside id="radar-guide" className="overflow-hidden rounded-lg border border-[#D8E2F0] bg-white shadow-[0_18px_45px_rgba(13,41,86,0.08)]">
        <div className="p-5 md:p-6">
          <h2 className="text-xl font-semibold text-[#0D2956]">Näin luet tutkaa</h2>
          <div className="mt-5 grid gap-5 text-sm text-[#40516D]">
            <LegendItem marker={<span className="block h-6 w-6 rounded-full border border-[#0D2956]" />} title="Sektori = PESTEC">
              Sijoittuu ensisijaisen PESTEC-luokan mukaan.
            </LegendItem>
            <LegendItem marker={<span className="grid h-7 w-7 place-items-center rounded-full border border-[#9CB5DA]"><span className="h-4 w-4 rounded-full border border-[#9CB5DA]" /></span>} title="Kehä = vastehorisontti">
              act (0-12 kk) - prepare (1-3 v) - watch (&gt; 3 v)
            </LegendItem>
            <LegendItem marker={<DirectionDots />} title="Väri = suunta">
              Vihreä = opportunity - Punainen = risk - Sininen = mixed
            </LegendItem>
            <LegendItem marker={<span className="block h-6 w-6 rounded-full border border-[#0D2956]" />} title="Koko = impact / relevance">
              Suurempi piste tarkoittaa suurempaa vaikutusta.
            </LegendItem>
            <LegendItem marker={<span className="block h-6 w-6 rounded-full border border-[#0D2956] opacity-70" />} title="Läpinäkyvyys / reunus = confidence">
              Selkeä reunus = korkea arvioijan varmuus.
            </LegendItem>
            <LegendItem marker={<Sparkles size={24} className="text-[#0D2956]" />} title="Korostus = novelty">
              Tummempi väri kertoo korkeammasta uutuusarvosta.
            </LegendItem>
          </div>

          <div className="mt-6 rounded-md bg-[#F3F7FD] p-4 text-sm leading-6 text-[#0A3A8F]">
            {active ? (
              <>
                <p className="font-semibold text-[#0D2956]">{active.title}</p>
                <p className="mt-2 text-[#40516D]">{active.summary}</p>
                <Link href={`/signals/${active.id}`} className="mt-3 inline-flex font-semibold text-[#0A3A8F]">
                  Avaa tarkempi näkymä
                </Link>
              </>
            ) : (
              <div className="flex gap-3">
                <Sparkles size={24} className="mt-1 shrink-0" />
                <p>Vie osoitin pisteen päälle nähdäksesi signaalin tiivistelmän. Klikkaa avataksesi tarkemman näkymän.</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[#D8E2F0] p-5 md:p-6">
          <h3 className="text-base font-semibold text-[#0D2956]">Pikasuodattimet</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => changeFilter(item.code)}
                className={`focus-ring rounded-md border px-3 py-2 text-sm font-semibold ${
                  filter === item.code
                    ? "border-[#0A3A8F] bg-[#0A3A8F] text-white"
                    : filterColorClass(item.code)
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => changeFilter("all")}
            className="focus-ring mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0A3A8F]"
          >
            <RotateCcw size={16} /> Tyhjennä suodattimet
          </button>
        </div>
      </aside>
    </section>
  );

  function changeFilter(nextFilter: FilterCode) {
    setActiveId(null);
    setFilter(nextFilter);
  }
}

function LegendItem({ marker, title, children }: { marker: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[32px_1fr] gap-3">
      <div className="pt-1">{marker}</div>
      <div>
        <p className="font-semibold text-[#0D2956]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#526684]">{children}</p>
      </div>
    </div>
  );
}

function DirectionDots() {
  return (
    <span className="relative block h-7 w-7">
      <span className="absolute left-1 top-1 h-3 w-3 rounded-full bg-[#2EA66F]" />
      <span className="absolute bottom-1 left-0 h-3 w-3 rounded-full bg-[#F05A28]" />
      <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-[#1F63C6]" />
    </span>
  );
}

function sectorIndexFor(signal: SignalCard, index: number) {
  const sectorIndex = sectorOrder.indexOf(signal.sectorCode ?? "");
  return sectorIndex >= 0 ? sectorIndex : index % sectorOrder.length;
}

function sectorLabel(code: string) {
  const labels: Record<string, { short: string; long: string }> = {
    political: { short: "P", long: "Poliittinen" },
    economic: { short: "E", long: "Taloudellinen" },
    social: { short: "S", long: "Sosiaalinen" },
    technological: { short: "T", long: "Teknologinen" },
    environmental: { short: "E", long: "Ympäristöllinen" },
    cultural: { short: "C", long: "Kulttuurinen" }
  };
  return labels[code] ?? { short: code.slice(0, 1).toUpperCase(), long: code };
}

function matchesFilter(signal: SignalCard, code: FilterCode) {
  const selected = filters.find((item) => item.code === code);
  if (!selected || selected.kind === "all") return true;
  if (selected.kind === "horizon") return normalizeCode(signal.horizonCode) === code;
  return normalizeCode(signal.directionCode) === code;
}

function normalizeCode(value: string | null | undefined) {
  return value?.trim().toLowerCase();
}

function filterColorClass(code: FilterCode) {
  if (code === "opportunity") return "border-[#B9DDCB] bg-[#F2FBF6] text-[#11733F]";
  if (code === "risk") return "border-[#F6CFC2] bg-[#FFF4F0] text-[#C23A18]";
  if (code === "mixed") return "border-[#C9D8EE] bg-white text-[#0A3A8F]";
  return "border-[#C9D8EE] bg-white text-[#0D2956]";
}

function seed(value: string, salt: number) {
  let hash = salt;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 9973;
  }
  return hash / 9973;
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}
