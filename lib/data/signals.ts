import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SignalCard, SignalDetail } from "@/lib/types/signals";

type DbRow = Record<string, unknown>;

export async function getPublicSignals(): Promise<SignalCard[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data: viewData, error: viewError } = await supabase
    .from("published_signal_cards")
    .select("*")
    .order("updated_at", { ascending: false });

  if (!viewError && viewData) {
    return viewData.map(mapSignalCard);
  }

  const { data } = await supabase
    .from("signals")
    .select(
      "id, signal_code, title, summary, detected_at, created_at, updated_at, signal_statuses!inner(code, name_fi), signal_assessments!inner(is_current, impact_score, relevance_score, confidence_score, novelty_score, primary_sector_id, response_horizon_id, direction_id, sectors(code, name_fi), response_horizons(code, name_fi), directions(code, name_fi))"
    )
    .eq("signal_statuses.code", "published")
    .eq("signal_assessments.is_current", true)
    .order("updated_at", { ascending: false });

  return (data ?? []).map(mapEmbeddedSignalCard);
}

export async function getAdminSignals(): Promise<SignalCard[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("signals")
    .select(
      "id, signal_code, title, summary, detected_at, created_at, updated_at, signal_status_id, signal_statuses(code, name_fi), signal_assessments(is_current, impact_score, relevance_score, confidence_score, novelty_score, primary_sector_id, response_horizon_id, direction_id, sectors(code, name_fi), response_horizons(code, name_fi), directions(code, name_fi))"
    )
    .order("updated_at", { ascending: false });

  return (data ?? []).map(mapEmbeddedSignalCard);
}

export async function getSignalDetail(id: string, includeDrafts: boolean): Promise<SignalDetail | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("signals")
    .select(
      "id, signal_code, title, summary, description, detected_at, created_at, updated_at, signal_status_id, signal_statuses(code, name_fi), signal_sources(sources(id, title, url, publisher, publication_date, notes)), signal_assessments(id, version, is_current, primary_sector_id, response_horizon_id, direction_id, impact_score, uncertainty_score, confidence_score, relevance_score, novelty_score, assessment_rationale, what_if_question, sectors(code, name_fi), response_horizons(code, name_fi), directions(code, name_fi)), signal_themes(themes(id, name, description)), innovation_implications(id, title, description, second_order_effects, potential_impact_score, actionability_score)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as DbRow;
  const statusCode = text(object(row.signal_statuses), "code");
  if (!includeDrafts && statusCode !== "published") return null;

  return mapSignalDetail(row);
}

function mapSignalCard(row: DbRow): SignalCard {
  return {
    id: text(row, "id") ?? "",
    code: text(row, "signal_code"),
    title: text(row, "title") ?? "",
    summary: text(row, "summary") ?? "",
    statusId: text(row, "signal_status_id"),
    statusCode: text(row, "status_code") ?? text(row, "signal_status_code"),
    statusName: text(row, "status_name_fi") ?? text(row, "status_name"),
    sectorId: text(row, "primary_sector_id"),
    sectorCode: text(row, "sector_code"),
    sectorName: text(row, "sector_name_fi") ?? text(row, "sector_name"),
    horizonId: text(row, "response_horizon_id"),
    horizonCode: text(row, "horizon_code") ?? text(row, "response_horizon_code"),
    horizonName: text(row, "horizon_name_fi") ?? text(row, "horizon_name"),
    directionId: text(row, "direction_id"),
    directionCode: text(row, "direction_code"),
    directionName: text(row, "direction_name_fi") ?? text(row, "direction_name"),
    impactScore: number(row, "impact_score"),
    relevanceScore: number(row, "relevance_score"),
    confidenceScore: number(row, "confidence_score"),
    noveltyScore: number(row, "novelty_score"),
    detectedAt: text(row, "detected_at"),
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at")
  };
}

function mapEmbeddedSignalCard(row: DbRow): SignalCard {
  const assessments = rows(row.signal_assessments);
  const assessment = assessments.find((item) => boolean(item, "is_current")) ?? object(row.signal_assessments);
  const status = object(row.signal_statuses);
  const sector = object(assessment?.sectors);
  const horizon = object(assessment?.response_horizons);
  const direction = object(assessment?.directions);

  return {
    id: text(row, "id") ?? "",
    code: text(row, "signal_code"),
    title: text(row, "title") ?? "",
    summary: text(row, "summary") ?? "",
    statusId: text(row, "signal_status_id"),
    statusCode: text(status, "code"),
    statusName: text(status, "name_fi"),
    sectorId: text(assessment, "primary_sector_id"),
    sectorCode: text(sector, "code"),
    sectorName: text(sector, "name_fi"),
    horizonId: text(assessment, "response_horizon_id"),
    horizonCode: text(horizon, "code"),
    horizonName: text(horizon, "name_fi"),
    directionId: text(assessment, "direction_id"),
    directionCode: text(direction, "code"),
    directionName: text(direction, "name_fi"),
    impactScore: number(assessment, "impact_score"),
    relevanceScore: number(assessment, "relevance_score"),
    confidenceScore: number(assessment, "confidence_score"),
    noveltyScore: number(assessment, "novelty_score"),
    detectedAt: text(row, "detected_at"),
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at")
  };
}

function mapSignalDetail(row: DbRow): SignalDetail {
  const assessments = rows(row.signal_assessments);
  const assessment = assessments.find((item) => boolean(item, "is_current")) ?? object(row.signal_assessments);

  return {
    ...mapEmbeddedSignalCard({ ...row, signal_assessments: assessment }),
    description: text(row, "description"),
    uncertaintyScore: number(assessment, "uncertainty_score"),
    assessmentRationale: text(assessment, "assessment_rationale"),
    whatIfQuestion: text(assessment, "what_if_question"),
    sources: rows(row.signal_sources)
      .map((item) => object(item.sources))
      .filter(Boolean)
      .map((source) => ({
        id: text(source, "id") ?? "",
        title: text(source, "title"),
        url: text(source, "url"),
        publisher: text(source, "publisher"),
        publicationDate: text(source, "publication_date"),
        notes: text(source, "notes")
      })),
    themes: rows(row.signal_themes)
      .map((item) => object(item.themes))
      .filter(Boolean)
      .map((theme) => ({ id: text(theme, "id") ?? "", name: text(theme, "name") ?? "", description: text(theme, "description") })),
    implications: rows(row.innovation_implications).map((item) => ({
      id: text(item, "id") ?? "",
      title: text(item, "title") ?? "",
      description: text(item, "description"),
      secondOrderEffects: text(item, "second_order_effects"),
      potentialImpactScore: number(item, "potential_impact_score"),
      actionabilityScore: number(item, "actionability_score")
    }))
  };
}

function object(value: unknown): DbRow | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as DbRow) : undefined;
}

function rows(value: unknown): DbRow[] {
  return Array.isArray(value) ? value.map(object).filter((item): item is DbRow => Boolean(item)) : [];
}

function text(row: DbRow | undefined, key: string): string | null {
  const value = row?.[key];
  return typeof value === "string" ? value : null;
}

function number(row: DbRow | undefined, key: string): number | null {
  const value = row?.[key];
  return typeof value === "number" ? value : null;
}

function boolean(row: DbRow | undefined, key: string): boolean {
  return row?.[key] === true;
}
