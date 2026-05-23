const sections = [
  {
    title: "Mikä on signaali?",
    text: "Signaali on yksittäinen havainto, joka voi kertoa nousevasta ilmiöstä, muutoksen ensimerkeistä tai toimintaympäristön epäjatkuvuudesta."
  },
  {
    title: "Signaali ja trendi",
    text: "Trendi ei ole yksittäinen havainto. Trendi muodostuu useista signaaleista, jotka yhdessä kuvaavat laajempaa kehityskulkua."
  },
  {
    title: "PESTEC",
    text: "PESTEC on pysyvä pääluokitus: political, economic, social, technological, environmental ja cultural."
  },
  {
    title: "Vastehorisontti",
    text: "Act tarkoittaa 0-12 kuukauden toimintatarvetta, prepare 1-3 vuoden valmistautumista ja watch yli 3 vuoden seurantaa."
  },
  {
    title: "Direction",
    text: "Direction kuvaa signaalin pääsuuntaa: opportunity, risk tai mixed."
  },
  {
    title: "Pisteytykset",
    text: "Impact, relevance, confidence, uncertainty ja novelty ohjaavat analyysia sekä tutkan visuaalista logiikkaa."
  }
];

export default function MethodPage() {
  return (
    <div className="page-shell">
      <div className="container max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3168CE]">Info / Method</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#0D2956]">Menetelmä ja luokittelut</h1>
        <div className="mt-8 grid gap-4">
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-[#D8E2F0] bg-white p-5">
              <h2 className="text-lg font-semibold text-[#0D2956]">{section.title}</h2>
              <p className="mt-2 leading-7 text-[#40516D]">{section.text}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
