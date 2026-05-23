export function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[#D8E2F0] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#607089]">{label}</p>
        <div className="text-[#0A3A8F]">{icon}</div>
      </div>
      <p className="mt-4 text-4xl font-semibold text-[#0D2956]">{value}</p>
    </section>
  );
}
