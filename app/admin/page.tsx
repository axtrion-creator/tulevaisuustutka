import Link from "next/link";
import { Plus, Table2 } from "lucide-react";
import { getAdminSignals } from "@/lib/data/signals";

export default async function AdminPage() {
  const signals = await getAdminSignals();

  return (
    <div className="page-shell">
      <div className="container">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3168CE]">Admin</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#0D2956]">Ylläpito</h1>
          </div>
          <Link
            href="/admin/signals/new"
            className="focus-ring inline-flex w-fit items-center gap-2 rounded-md bg-[#0A3A8F] px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={16} /> Lisää signaali
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <AdminTile href="/admin/signals/new" icon={<Plus size={24} />} title="Uusi signaali" text="Tallenna draft tai julkaistu signaali." />
          <AdminTile href="/signals" icon={<Table2 size={24} />} title="Signaalit" text="Selaa ja muokkaa kaikkia statuksia." />
          <div className="rounded-lg border border-[#D8E2F0] bg-white p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#607089]">Yhteensä</p>
            <p className="mt-3 text-4xl font-semibold text-[#0D2956]">{signals.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminTile({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="rounded-lg border border-[#D8E2F0] bg-white p-5 shadow-sm">
      <div className="mb-4 text-[#0A3A8F]">{icon}</div>
      <h2 className="text-lg font-semibold text-[#0D2956]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#607089]">{text}</p>
    </Link>
  );
}
