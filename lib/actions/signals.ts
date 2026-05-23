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
  const sourceUrl = value(formData, "source_url");
  const sourceNote = value(formData, "source_note");

  const status = await lookupCode("signal_statuses", statusId);
  validateSignal({
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
    title,
    summary,
    description: description || null,
    signal_status_id: statusId || null,
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

  if (sourceUrl || sourceNote || value(formData, "source_title")) {
    const { data: sourceData, error: sourceError } = await client
      .from("sources")
      .insert({
        title: value(formData, "source_title") || sourceUrl || "Lähde",
        url: sourceUrl || null,
        notes: sourceNote || null
      })
      .select("id")
      .single();

    if (sourceError) throw new Error(sourceError.message);

    const { error: linkError } = await client
      .from("signal_sources")
      .insert({ signal_id: signalId, source_id: sourceData.id });

    if (linkError) throw new Error(linkError.message);
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
      title: value(formData, "implication_title") || "Implikaatio",
      description: value(formData, "implication_description") || null
    });

    if (implicationError) throw new Error(implicationError.message);
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

function numberValue(formData: FormData, key: string) {
  const raw = value(formData, key);
  return raw ? Number(raw) : null;
}

function validateSignal(input: {
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
