import { getPublicSignals } from "@/lib/data/signals";

export async function getDashboardStats() {
  const signals = await getPublicSignals();
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  return {
    totalPublished: signals.length,
    newSignals: signals.filter((signal) => {
      const created = new Date(signal.createdAt ?? 0).getTime();
      return Number.isFinite(created) && now - created <= thirtyDays;
    }).length,
    bySector: group(signals.map((signal) => signal.sectorName ?? "Luokittelematon")),
    byHorizon: group(signals.map((signal) => signal.horizonName ?? "Ei horisonttia")),
    byDirection: group(signals.map((signal) => signal.directionName ?? signal.directionCode ?? "Ei suuntaa")),
    latest: [...signals]
      .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime())
      .slice(0, 6),
    highImpact: signals.filter((signal) => (signal.impactScore ?? 0) >= 4).slice(0, 6)
  };
}

function group(values: string[]) {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}
