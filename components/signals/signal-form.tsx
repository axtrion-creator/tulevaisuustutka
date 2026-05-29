"use client";

import { useState } from "react";
import { saveSignal } from "@/lib/actions/signals";
import type { LookupOptions, SignalDetail } from "@/lib/types/signals";

const ingestionMethods = [
  { id: "manual", label: "Manual" },
  { id: "ai_suggested", label: "AI-ehdotus" },
  { id: "imported", label: "Tuotu" }
];

const scoreHelp = {
  impact: ["Hyvin pieni", "Pieni", "Kohtalainen", "Suuri", "Erittäin suuri"],
  relevance: ["Hyvin matala", "Matala", "Kohtalainen", "Korkea", "Erittäin korkea"],
  confidence: ["Hyvin epävarma", "Epävarma", "Kohtalainen", "Vahva", "Erittäin vahva"],
  uncertainty: ["Hyvin matala", "Matala", "Kohtalainen", "Korkea", "Erittäin korkea"],
  novelty: ["Tuttu", "Melko tuttu", "Kohtalainen", "Uusi", "Hyvin uusi"]
};

const supplementalScoreHelp = {
  credibility: ["Hyvin heikko", "Heikko", "Kohtalainen", "Uskottava", "Erittäin uskottava"],
  actionability: ["Hyvin vaikea", "Vaikea", "Kohtalainen", "Toteutettavissa", "Helposti toteutettavissa"],
  relationshipStrength: ["Hyvin heikko", "Heikko", "Kohtalainen", "Vahva", "Erittäin vahva"]
};

const impactCoefficientOptions = [
  { id: "-3", label: "-3: vahvasti heikentävä" },
  { id: "-2", label: "-2: heikentävä" },
  { id: "-1", label: "-1: hieman heikentävä" },
  { id: "0", label: "0: neutraali" },
  { id: "1", label: "1: hieman vahvistava" },
  { id: "2", label: "2: vahvistava" },
  { id: "3", label: "3: vahvasti vahvistava" }
];

export function SignalForm({
  mode,
  lookups,
  signal
}: {
  mode: "create" | "edit";
  lookups: LookupOptions;
  signal?: SignalDetail;
}) {
  const firstSource = signal?.sources[0];
  const firstImplication = signal?.implications[0];
  const firstRelationship = signal?.relationships[0];
  const themeNames = signal?.themes.map((theme) => theme.name).join(", ");
  const relationshipTargets = lookups.signalTargets.filter((option) => option.id !== signal?.id);

  return (
    <form action={saveSignal} className="mt-8 grid gap-6 rounded-lg border border-[#D8E2F0] bg-white p-5 shadow-sm">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="id" value={signal?.id ?? ""} />

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Otsikko" name="title" defaultValue={signal?.title} required requiredMark />
        <Field label="Signaalikoodi" name="signal_code" defaultValue={signal?.code} />
        <SelectField label="Status" name="status_id" options={lookups.statuses} defaultValue={signal?.statusId} required requiredMark />
        <SelectField label="Syöttötapa" name="ingestion_method" options={ingestionMethods} defaultValue={signal?.ingestionMethod ?? "manual"} />
      </div>

      <DateField label="Poimintapäivä" name="extraction_date" defaultValue={signal?.extractionDate ?? todayDate()} required requiredMark />

      <Field label="Tiivistelmä" name="summary" defaultValue={signal?.summary} required requiredMark />
      <TextArea label="Kuvaus" name="description" defaultValue={signal?.description} requiredMark />

      <div className="grid gap-4 md:grid-cols-3">
        <SelectField label="PESTEC" name="primary_sector_id" options={lookups.sectors} defaultValue={signal?.sectorId} requiredMark />
        <SelectField label="Vastehorisontti" name="response_horizon_id" options={lookups.responseHorizons} defaultValue={signal?.horizonId} requiredMark />
        <SelectField label="Suunta" name="direction_id" options={lookups.directions} defaultValue={signal?.directionId} requiredMark />
      </div>

      <CheckboxGroup
        label="Toissijaiset PESTEC-sektorit"
        name="secondary_sector_ids"
        options={lookups.sectors}
        defaultValues={signal?.secondarySectorIds ?? []}
      />

      <Field
        label="Teemat"
        name="theme_names"
        defaultValue={themeNames}
        placeholder="Esim. energia, tekoäly, sääntely"
        help="Erota teemat pilkulla, esimerkiksi: energia, tekoäly, sääntely"
      />

      <div className="grid gap-4 md:grid-cols-5">
        <NumberField label="Vaikutus" name="impact_score" defaultValue={signal?.impactScore} requiredMark scaleLabels={scoreHelp.impact} />
        <NumberField label="Relevanssi" name="relevance_score" defaultValue={signal?.relevanceScore} requiredMark scaleLabels={scoreHelp.relevance} />
        <NumberField label="Varmuus" name="confidence_score" defaultValue={signal?.confidenceScore} requiredMark scaleLabels={scoreHelp.confidence} />
        <NumberField label="Epävarmuus" name="uncertainty_score" defaultValue={signal?.uncertaintyScore} scaleLabels={scoreHelp.uncertainty} />
        <NumberField label="Uutuusarvo" name="novelty_score" defaultValue={signal?.noveltyScore} requiredMark scaleLabels={scoreHelp.novelty} />
      </div>

      <TextArea label="Arvioinnin perustelu" name="assessment_rationale" defaultValue={signal?.assessmentRationale} requiredMark />
      <Field label="What if? -kysymys" name="what_if_question" defaultValue={signal?.whatIfQuestion} />

      <section className="grid gap-4 rounded-md bg-[#EEF3FB] p-4">
        <div>
          <h2 className="font-semibold text-[#0D2956]">Lähde</h2>
          <p className="mt-1 text-sm text-[#607089]">Pakollinen draftille: URL tai lähdemuistiinpano *</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Lähteen otsikko" name="source_title" defaultValue={firstSource?.title} />
          <Field label="URL" name="source_url" defaultValue={firstSource?.url} />
          <Field label="Julkaisija" name="source_publisher" defaultValue={firstSource?.publisher} />
          <DateField label="Julkaisupäivä" name="source_publication_date" defaultValue={firstSource?.publicationDate} />
          <SelectField label="Lähdetyyppi" name="source_type_id" options={lookups.sourceTypes} defaultValue={firstSource?.sourceTypeId} />
          <Field label="DOI" name="source_doi" defaultValue={firstSource?.doi} />
          <Field label="Patenttinumero" name="source_patent_number" defaultValue={firstSource?.patentNumber} />
          <NumberField
            label="Lähteen uskottavuus"
            name="credibility_score"
            defaultValue={firstSource?.credibilityScore}
            scaleLabels={supplementalScoreHelp.credibility}
          />
          <NumberField
            label="Lähteen relevanssi"
            name="source_relevance_score"
            defaultValue={firstSource?.sourceRelevanceScore}
            scaleLabels={scoreHelp.relevance}
          />
        </div>
        <TextArea label="Lähdemuistiinpano" name="source_note" defaultValue={firstSource?.notes} />
        <TextArea label="Evidenssihuomio" name="evidence_note" defaultValue={firstSource?.evidenceNote} />
      </section>

      <section className="grid gap-4 rounded-md bg-[#EEF3FB] p-4">
        <h2 className="font-semibold text-[#0D2956]">Implikaatio</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Otsikko" name="implication_title" defaultValue={firstImplication?.title} />
          <SelectField label="Implikaatiotyyppi" name="implication_type_id" options={lookups.implicationTypes} defaultValue={firstImplication?.implicationTypeId} />
          <SelectField label="Aikahorisontti" name="implication_time_horizon_id" options={lookups.timeHorizons} defaultValue={firstImplication?.timeHorizonId} />
          <NumberField
            label="Potentiaalinen vaikutus"
            name="potential_impact_score"
            defaultValue={firstImplication?.potentialImpactScore}
            scaleLabels={scoreHelp.impact}
          />
          <NumberField
            label="Toimittavuus"
            name="actionability_score"
            defaultValue={firstImplication?.actionabilityScore}
            scaleLabels={supplementalScoreHelp.actionability}
          />
        </div>
        <TextArea label="Kuvaus" name="implication_description" defaultValue={firstImplication?.description} />
        <TextArea label="Toisen kertaluokan vaikutukset" name="second_order_effects" defaultValue={firstImplication?.secondOrderEffects} />
      </section>

      <section className="grid gap-4 rounded-md bg-[#EEF3FB] p-4">
        <h2 className="font-semibold text-[#0D2956]">Suhde toiseen signaaliin</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            label="Kohdesignaali"
            name="relationship_target_signal_id"
            options={relationshipTargets}
            defaultValue={firstRelationship?.targetEntityId}
          />
          <SelectField
            label="Suhdetyyppi"
            name="relationship_type_id"
            options={lookups.relationshipTypes}
            defaultValue={firstRelationship?.relationshipTypeId}
          />
          <NumberField
            label="Suhteen vahvuus"
            name="relationship_strength_score"
            defaultValue={firstRelationship?.strengthScore}
            scaleLabels={supplementalScoreHelp.relationshipStrength}
          />
          <SelectField
            label="Vaikutuskerroin"
            name="relationship_impact_coefficient"
            options={impactCoefficientOptions}
            defaultValue={firstRelationship?.impactCoefficient?.toString()}
          />
        </div>
        <TextArea label="Suhteen perustelu" name="relationship_impact_rationale" defaultValue={firstRelationship?.impactRationale} />
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
  required,
  requiredMark,
  placeholder,
  help
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  requiredMark?: boolean;
  placeholder?: string;
  help?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#0D2956]">
      <LabelText label={label} required={requiredMark} />
      <input
        className="focus-ring rounded-md border border-[#B9C9E4] bg-white px-3 py-2 font-normal"
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
      />
      {help ? <span className="text-xs font-medium text-[#607089]">{help}</span> : null}
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  requiredMark
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  requiredMark?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#0D2956]">
      <LabelText label={label} required={requiredMark} />
      <textarea
        className="focus-ring min-h-28 rounded-md border border-[#B9C9E4] bg-white px-3 py-2 font-normal"
        name={name}
        defaultValue={defaultValue ?? ""}
      />
    </label>
  );
}

function NumberField({
  label,
  name,
  defaultValue,
  requiredMark,
  scaleLabels
}: {
  label: string;
  name: string;
  defaultValue?: number | null;
  requiredMark?: boolean;
  scaleLabels?: string[];
}) {
  const [currentValue, setCurrentValue] = useState(defaultValue?.toString() ?? "");
  const parsedValue = Number(currentValue);
  const selectedLabel = Number.isInteger(parsedValue) ? scaleLabels?.[parsedValue - 1] : undefined;

  return (
    <label className="grid gap-2 text-sm font-semibold text-[#0D2956]">
      <LabelText label={label} required={requiredMark} />
      <input
        className="focus-ring rounded-md border border-[#B9C9E4] bg-white px-3 py-2 font-normal"
        name={name}
        type="number"
        min="1"
        max="5"
        defaultValue={defaultValue ?? ""}
        onChange={(event) => setCurrentValue(event.target.value)}
      />
      {scaleLabels ? (
        <span className="text-xs font-medium text-[#607089]">
          {selectedLabel ? `${parsedValue} = ${selectedLabel}` : "1-5: matala - korkea"}
        </span>
      ) : null}
    </label>
  );
}

function DateField({
  label,
  name,
  defaultValue,
  required,
  requiredMark
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  requiredMark?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#0D2956]">
      <LabelText label={label} required={requiredMark} />
      <input
        className="focus-ring rounded-md border border-[#B9C9E4] bg-white px-3 py-2 font-normal"
        name={name}
        type="date"
        defaultValue={defaultValue ?? ""}
        required={required}
      />
    </label>
  );
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
  required,
  requiredMark
}: {
  label: string;
  name: string;
  options: Array<{ id: string; label: string }>;
  defaultValue?: string | null;
  required?: boolean;
  requiredMark?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#0D2956]">
      <LabelText label={label} required={requiredMark} />
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

function CheckboxGroup({
  label,
  name,
  options,
  defaultValues
}: {
  label: string;
  name: string;
  options: Array<{ id: string; label: string }>;
  defaultValues: string[];
}) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-semibold text-[#0D2956]">{label}</legend>
      <div className="grid gap-2 md:grid-cols-3">
        {options.map((option) => (
          <label key={option.id} className="flex items-center gap-2 text-sm font-medium text-[#40516D]">
            <input
              className="h-4 w-4 accent-[#0A3A8F]"
              type="checkbox"
              name={name}
              value={option.id}
              defaultChecked={defaultValues.includes(option.id)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function LabelText({ label, required }: { label: string; required?: boolean }) {
  return (
    <span>
      {label}
      {required ? <span className="text-[#B42318]"> *</span> : null}
    </span>
  );
}
