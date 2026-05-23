import { SignalTable } from "@/components/signals/signal-table";
import { getCurrentProfile } from "@/lib/auth/admin";
import { getAdminSignals, getPublicSignals } from "@/lib/data/signals";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignalsPage({ searchParams }: Props) {
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "admin";
  const signals = isAdmin ? await getAdminSignals() : await getPublicSignals();

  return (
    <div className="page-shell">
      <div className="container">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3168CE]">
            Signaalit
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#0D2956]">Signaalitaulukko</h1>
        </div>
        <SignalTable signals={signals} isAdmin={isAdmin} initialQuery={typeof params?.q === "string" ? params.q : ""} />
      </div>
    </div>
  );
}
