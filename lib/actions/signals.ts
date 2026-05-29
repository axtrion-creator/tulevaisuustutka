"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function saveSignal(formData: FormData) {
  const profile = await requireAdmin();
  if (!profile) {
    redirect("/login");
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase-ympäristömuuttujat puuttuvat.");
  }
  const client = supabase;

  const mode = value(formData, "mode");
  const id = value(formData, "id");
  const statusId = value(formData, "status_id");
  const title = value(formData, "title");
  const summary = value(formData, "summary");
  const description = value(formData, "description");
  const sourceTitle = value(formData, "source_title");
  const sourceUrl = value(formData, "source_url");
  const sourceNote = value(formData, "source_note");
  const extractionDate = value(formData, "extraction_date") || todayDate();

  const status = await lookupCode("signal_statuses", statusId);
  validateSignal({
    statusId,
    status,
    title,
    summary,
    description,
    sourceUrl,
    sourceNote,
    primarySectorId: value(formData, "primary_sector_id"),
    responseHorizonId: value(formData, "response_horizon_id"),
    directionId: value(formData, "direction_id"),
    impactScore: numberValue(formData, "impact_score"),
    confidenceScore: numberValue(formData, "confidence_score"),
    relevanceScore: numberValue(formData, "relevance_score"),
    noveltyScore: numberValue(formData, "novelty_score"),
    assessmentRationale: value(formData, "assessment_rationale")
  });

  const signalPayload = {
    signal_code: value(formData, "signal_code") || null,
    title,
    summary,
    description: description || null,
    signal_status_id: statusId || null,
    extraction_date: extractionDate,
    ingestion_method: value(formData, "ingestion_method") || "manual",
    updated_at: new Date().toISOString(),
    created_by: profile.id
  };

  const signalResult =
    mode === "edit" && id
      ? await client.from("signals").update(signalPayload).eq("id", id).select("id").single()
      : await client.from("signals").insert(signalPayload).select("id").single();

  if (signalResult.error) {
    throw new Error(signalResult.error.message);
  }

  const signalId = typeof signalResult.data.id === "string" ? signalResult.data.id : String(signalResult.data.id);

  if (mode === "edit") {
    await Promise.all([
      client.from("signal_sources").delete().eq("signal_id", signalId),
      client.from("signal_secondary_sectors").delete().eq("signal_id", signalId),
      client.from("signal_themes").delete().eq("signal_id", signalId),
      client.from("innovation_implications").delete().eq("signal_id", signalId),
      client.from("entity_relationships").delete().eq("source_entity_type", "signal").eq("source_entity_id", signalId)
    ]);
  }

  const hasSource =
    sourceTitle ||
    sourceUrl ||
    sourceNote ||
    value(formData, "source_publisher") ||
    value(formData, "source_publication_date") ||
    value(formData, "source_type_id") ||
    value(formData, "source_doi") ||
    value(formData, "source_patent_number");

  if (hasSource) {
    const { data: sourceData, error: sourceError } = await client
      .from("sources")
      .insert({
        title: sourceTitle || sourceUrl || "Lähde",
        url: sourceUrl || null,
        publisher: value(formData, "source_publisher") || null,
        publication_date: value(formData, "source_publication_date") || null,
        source_type_id: value(formData, "source_type_id") || null,
        doi: value(formData, "source_doi") || null,
        patent_number: value(formData, "source_patent_number") || null,
        notes: sourceNote || null
      })
      .select("id")
      .single();

    if (sourceError) throw new Error(sourceError.message);

    const sourceId = typeof sourceData.id === "string" ? sourceData.id : String(sourceData.id);
    const { error: linkError } = await client.from("signal_sources").insert({
      signal_id: signalId,
      source_id: sourceId,
      credibility_score: numberValue(formData, "credibility_score"),
      source_relevance_score: numberValue(formData, "source_relevance_score"),
      evidence_note: value(formData, "evidence_note") || null
    });

    if (linkError) throw new Error(linkError.message);
  }

  const secondarySectorIds = values(formData, "secondary_sector_ids").filter(
    (sectorId) => sectorId !== value(formData, "primary_sector_id")
  );
  if (secondarySectorIds.length > 0) {
    const { error: secondarySectorError } = await client.from("signal_secondary_sectors").insert(
      secondarySectorIds.map((sectorId) => ({
        signal_id: signalId,
        sector_id: sectorId
      }))
    );

    if (secondarySectorError) throw new Error(secondarySectorError.message);
  }

  const themeNames = value(formData, "theme_names")
    .split(",")
    .map((themeName) => themeName.trim())
    .filter(Boolean);

  for (const themeName of themeNames) {
    const { data: themeData, error: themeError } = await client
      .from("themes")
      .upsert({ name: themeName }, { onConflict: "name" })
      .select("id")
      .single();

    if (themeError) throw new Error(themeError.message);

    const themeId = typeof themeData.id === "string" ? themeData.id : String(themeData.id);
    const { error: themeLinkError } = await client.from("signal_themes").insert({
      signal_id: signalId,
      theme_id: themeId
    });

    if (themeLinkError) throw new Error(themeLinkError.message);
  }

  await client.from("signal_assessments").update({ is_current: false }).eq("signal_id", signalId).eq("is_current", true);

  const { data: latestAssessment } = await client
    .from("signal_assessments")
    .select("version")
    .eq("signal_id", signalId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const latestVersion = typeof latestAssessment?.version === "number" ? latestAssessment.version : 0;
  const nextVersion = latestVersion + 1;
  const { error: assessmentError } = await client.from("signal_assessments").insert({
    signal_id: signalId,
    version: nextVersion,
    is_current: true,
    primary_sector_id: value(formData, "primary_sector_id") || null,
    response_horizon_id: value(formData, "response_horizon_id") || null,
    direction_id: value(formData, "direction_id") || null,
    impact_score: numberValue(formData, "impact_score"),
    uncertainty_score: numberValue(formData, "uncertainty_score"),
    confidence_score: numberValue(formData, "confidence_score"),
    relevance_score: numberValue(formData, "relevance_score"),
    novelty_score: numberValue(formData, "novelty_score"),
    assessment_rationale: value(formData, "assessment_rationale") || null,
    what_if_question: value(formData, "what_if_question") || null,
    assessed_by: profile.id,
    assessed_at: new Date().toISOString()
  });

  if (assessmentError) throw new Error(assessmentError.message);

  if (value(formData, "implication_title") || value(formData, "implication_description")) {
    const { error: implicationError } = await client.from("innovation_implications").insert({
      signal_id: signalId,
      implication_type_id: value(formData, "implication_type_id") || null,
      title: value(formData, "implication_title") || "Implikaatio",
      description: value(formData, "implication_description") || null,
      second_order_effects: value(formData, "second_order_effects") || null,
      time_horizon_id: value(formData, "implication_time_horizon_id") || null,
      potential_impact_score: numberValue(formData, "potential_impact_score"),
      actionability_score: numberValue(formData, "actionability_score")
    });

    if (implicationError) throw new Error(implicationError.message);
  }

  const relationshipTargetId = value(formData, "relationship_target_signal_id");
  if (relationshipTargetId) {
    if (relationshipTargetId === signalId) {
      throw new Error("Signaalia ei voi suhteuttaa itseensä.");
    }

    const { error: relationshipError } = await client.from("entity_relationships").insert({
      source_entity_type: "signal",
      source_entity_id: signalId,
      target_entity_type: "signal",
      target_entity_id: relationshipTargetId,
      relationship_type_id: value(formData, "relationship_type_id") || null,
      strength_score: numberValue(formData, "relationship_strength_score"),
      impact_coefficient: numberValue(formData, "relationship_impact_coefficient"),
      impact_rationale: value(formData, "relationship_impact_rationale") || null
    });

    if (relationshipError) throw new Error(relationshipError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/radar");
  revalidatePath("/signals");
  revalidatePath(`/signals/${signalId}`);
  redirect(`/signals/${signalId}`);

  async function lookupCode(table: string, rowId: string) {
    if (!rowId) return "";
    const { data } = await client.from(table).select("code").eq("id", rowId).maybeSingle();
    return typeof data?.code === "string" ? data.code : "";
  }
}

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

function values(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((raw): raw is string => typeof raw === "string")
    .map((raw) => raw.trim())
    .filter(Boolean);
}

function numberValue(formData: FormData, key: string) {
  const raw = value(formData, key);
  return raw ? Number(raw) : null;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function validateSignal(input: {
  statusId: string;
  status: string;
  title: string;
  summary: string;
  description: string;
  sourceUrl: string;
  sourceNote: string;
  primarySectorId: string;
  responseHorizonId: string;
  directionId: string;
  impactScore: number | null;
  confidenceScore: number | null;
  relevanceScore: number | null;
  noveltyScore: number | null;
  assessmentRationale: string;
}) {
  if (!input.statusId) {
    throw new Error("Status on pakollinen.");
  }

  if (!input.title || !input.summary || (!input.sourceUrl && !input.sourceNote)) {
    throw new Error("Luonnos vaatii otsikon, tiivistelmän ja vähintään lähteen URL:n tai muistiinpanon.");
  }

  if (input.status !== "published") return;

  const missingPublishedField =
    !input.description ||
    !input.primarySectorId ||
    !input.responseHorizonId ||
    !input.directionId ||
    input.impactScore == null ||
    input.confidenceScore == null ||
    input.relevanceScore == null ||
    input.noveltyScore == null ||
    !input.assessmentRationale;

  if (missingPublishedField) {
    throw new Error("Julkaisu vaatii kuvauksen, luokittelut, pisteytykset ja arvioinnin perustelun.");
  }
}
