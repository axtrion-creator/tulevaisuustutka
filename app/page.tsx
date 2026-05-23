import Link from "next/link";
import { ArrowRight, Radar, Table2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="page-shell">
      <section className="container grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#3168CE]">
            Heikot signaalit näkyviksi
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-[#0D2956] md:text-6xl">
            Tulevaisuustutka
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#40516D]">
            Kokoa hajanaiset havainnot, arvioi niiden merkitys ja tarkastele julkaistuja signaaleja
            sekä taulukossa että visuaalisella tutkalla.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/radar"
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-[#0A3A8F] px-5 py-3 text-sm font-semibold text-white"
            >
              Avaa tutka <ArrowRight size={18} />
            </Link>
            <Link
              href="/signals"
              className="focus-ring inline-flex items-center gap-2 rounded-md border border-[#B9C9E4] bg-white px-5 py-3 text-sm font-semibold text-[#0D2956]"
            >
              Selaa signaaleja
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-[#D8E2F0] bg-white p-6 shadow-sm">
          <div className="grid gap-4">
            <div className="rounded-md bg-[#EEF3FB] p-5">
              <Radar className="mb-4 text-[#0A3A8F]" size={32} />
              <h2 className="text-xl font-semibold text-[#0D2956]">Analyyttinen tutkanäkymä</h2>
              <p className="mt-2 text-sm leading-6 text-[#607089]">
                Jokaisen pisteen sijainti, väri ja koko perustuvat eksplisiittisiin arviointikenttiin.
              </p>
            </div>
            <div className="rounded-md bg-[#EEF3FB] p-5">
              <Table2 className="mb-4 text-[#0A3A8F]" size={32} />
              <h2 className="text-xl font-semibold text-[#0D2956]">Rakenteinen signaalikanta</h2>
              <p className="mt-2 text-sm leading-6 text-[#607089]">
                Signaalit, lähteet, arviot, teemat ja implikaatiot pidetään erillisinä tietokohteina.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
