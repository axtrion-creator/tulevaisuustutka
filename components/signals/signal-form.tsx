import { saveSignal } from "@/lib/actions/signals";
import type { LookupOptions, SignalDetail } from "@/lib/types/signals";

export function SignalForm({
  mode,
  lookups,
  signal
}: {
  mode: "create" | "edit";
  lookups: LookupOptions;
  signal?: SignalDetail;
}) {
  return (
    <form action={saveSignal} className="mt-8 grid gap-6 rounded-lg border border-[#D8E2F0] bg-white p-5 shadow-sm">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="id" value={signal?.id ?? ""} />

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Otsikko" name="title" defaultValue={signal?.title} required />
        <SelectField label="Status" name="status_id" options={lookups.statuses} defaultValue={signal?.statusId} required />
      </div>

      <Field label="Tiivistelmä" name="summary" defaultValue={signal?.summary} required />
      <TextArea label="Kuvaus" name="description" defaultValue={signal?.description} />

      <div className="grid gap-4 md:grid-cols-3">
        <SelectField label="PESTEC" name="primary_sector_id" options={lookups.sectors} defaultValue={signal?.sectorId} />
        <SelectField label="Vastehorisontti" name="response_horizon_id" options={lookups.responseHorizons} defaultValue={signal?.horizonId} />
        <SelectField label="Suunta" name="direction_id" options={lookups.directions} defaultValue={signal?.directionId} />
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <NumberField label="Impact" name="impact_score" defaultValue={signal?.impactScore} />
        <NumberField label="Relevance" name="relevance_score" defaultValue={signal?.relevanceScore} />
        <NumberField label="Confidence" name="confidence_score" defaultValue={signal?.confidenceScore} />
        <NumberField label="Uncertainty" name="uncertainty_score" defaultValue={signal?.uncertaintyScore} />
        <NumberField label="Novelty" name="novelty_score" defaultValue={signal?.noveltyScore} />
      </div>

      <TextArea label="Arvioinnin perustelu" name="assessment_rationale" defaultValue={signal?.assessmentRationale} />
      <Field label="What if? -kysymys" name="what_if_question" defaultValue={signal?.whatIfQuestion} />

      <section className="grid gap-4 rounded-md bg-[#EEF3FB] p-4">
        <h2 className="font-semibold text-[#0D2956]">Lähde</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Lähteen otsikko" name="source_title" defaultValue={signal?.sources[0]?.title} />
          <Field label="URL" name="source_url" defaultValue={signal?.sources[0]?.url} />
        </div>
        <TextArea label="Lähdemuistiinpano" name="source_note" defaultValue={signal?.sources[0]?.notes} />
      </section>

      <section className="grid gap-4 rounded-md bg-[#EEF3FB] p-4">
        <h2 className="font-semibold text-[#0D2956]">Implikaatio</h2>
        <Field label="Otsikko" name="implication_title" defaultValue={signal?.implications[0]?.title} />
        <TextArea label="Kuvaus" name="implication_description" defaultValue={signal?.implications[0]?.description} />
      </section>

      <div className="flex justify-end">
        <button className="focus-ring rounded-md bg-[#0A3A8F] px-5 py-3 text-sm font-semibold text-white" type="submit">
          Tallenna
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#0D2956]">
      {label}
      <input
        className="focus-ring rounded-md border border-[#B9C9E4] bg-white px-3 py-2 font-normal"
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
      />
    </label>
  );
}

function TextArea({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string | null }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#0D2956]">
      {label}
      <textarea
        className="focus-ring min-h-28 rounded-md border border-[#B9C9E4] bg-white px-3 py-2 font-normal"
        name={name}
        defaultValue={defaultValue ?? ""}
      />
    </label>
  );
}

function NumberField({ label, name, defaultValue }: { label: string; name: string; defaultValue?: number | null }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#0D2956]">
      {label}
      <input
        className="focus-ring rounded-md border border-[#B9C9E4] bg-white px-3 py-2 font-normal"
        name={name}
        type="number"
        min="1"
        max="5"
        defaultValue={defaultValue ?? ""}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
  required
}: {
  label: string;
  name: string;
  options: Array<{ id: string; label: string }>;
  defaultValue?: string | null;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#0D2956]">
      {label}
      <select
        className="focus-ring rounded-md border border-[#B9C9E4] bg-white px-3 py-2 font-normal"
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
      >
        <option value="">Valitse</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
