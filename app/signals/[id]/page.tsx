import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/auth/admin";
import { getSignalDetail } from "@/lib/data/signals";
import { formatDate } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SignalDetailPage({ params }: Props) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const detail = await getSignalDetail(id, profile?.role === "admin");

  if (!detail) {
    notFound();
  }

  return (
    <div className="page-shell">
      <article className="container max-w-5xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge>{detail.statusName ?? detail.statusCode ?? "status puuttuu"}</Badge>
              <Badge tone="accent">{detail.sectorName ?? "PESTEC puuttuu"}</Badge>
              <Badge tone="neutral">{detail.horizonName ?? "horisontti puuttuu"}</Badge>
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-[#0D2956]">{detail.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#40516D]">{detail.summary}</p>
          </div>
          {profile?.role === "admin" ? (
            <Link
              href={`/admin/signals/${detail.id}/edit`}
              className="focus-ring rounded-md bg-[#0A3A8F] px-4 py-2 text-sm font-semibold text-white"
            >
              Muokkaa
            </Link>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-6">
            <Section title="Kuvaus">
              <p className="whitespace-pre-line leading-8 text-[#40516D]">{detail.description || "Kuvaus puuttuu."}</p>
            </Section>

            <Section title="Arviointi">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Score label="Vaikutus" value={detail.impactScore} />
                <Score label="Relevanssi" value={detail.relevanceScore} />
                <Score label="Varmuus" value={detail.confidenceScore} />
                <Score label="Epävarmuus" value={detail.uncertaintyScore} />
                <Score label="Uutuusarvo" value={detail.noveltyScore} />
              </div>
              <p className="mt-5 whitespace-pre-line leading-7 text-[#40516D]">
                {detail.assessmentRationale || "Arvioinnin perustelu puuttuu."}
              </p>
              {detail.whatIfQuestion ? (
                <p className="mt-5 rounded-md bg-[#EEF3FB] p-4 font-medium text-[#0D2956]">
                  Mitä jos? {detail.whatIfQuestion}
                </p>
              ) : null}
            </Section>

            <Section title="Implikaatiot">
              {detail.implications.length === 0 ? (
                <p className="text-sm text-[#607089]">Ei kirjattuja implikaatioita.</p>
              ) : (
                <div className="grid gap-3">
                  {detail.implications.map((item) => (
                    <div key={item.id} className="rounded-md border border-[#D8E2F0] p-4">
                      <p className="font-semibold text-[#0D2956]">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-[#607089]">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          <aside className="grid h-fit gap-6">
            <Section title="Lähteet">
              {detail.sources.length === 0 ? (
                <p className="text-sm text-[#607089]">Ei lähteitä.</p>
              ) : (
                <div className="grid gap-3">
                  {detail.sources.map((source) => (
                    <div key={source.id} className="text-sm">
                      {source.url ? (
                        <a className="font-semibold text-[#0A3A8F]" href={source.url} target="_blank" rel="noreferrer">
                          {source.title || source.url}
                        </a>
                      ) : (
                        <p className="font-semibold text-[#0D2956]">{source.title || "Nimetön lähde"}</p>
                      )}
                      <p className="mt-1 text-[#607089]">{source.publisher}</p>
                      <p className="text-[#607089]">{formatDate(source.publicationDate)}</p>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Teemat">
              <div className="flex flex-wrap gap-2">
                {detail.themes.length === 0 ? (
                  <p className="text-sm text-[#607089]">Ei teemoja.</p>
                ) : (
                  detail.themes.map((theme) => <Badge key={theme.id}>{theme.name}</Badge>)
                )}
              </div>
            </Section>

            <Section title="Trendit ja suhteet">
              <p className="text-sm leading-6 text-[#607089]">
                Trendit ja suhteet näytetään tässä, kun `signal_trends` ja `entity_relationships` ovat käytössä.
              </p>
            </Section>
          </aside>
        </div>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[#D8E2F0] bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-[#0D2956]">{title}</h2>
      {children}
    </section>
  );
}

function Score({ label, value }: { label: string; value?: number | null }) {
  return (
    <div className="rounded-md bg-[#EEF3FB] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#607089]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#0D2956]">{value ?? "-"}</p>
    </div>
  );
}
