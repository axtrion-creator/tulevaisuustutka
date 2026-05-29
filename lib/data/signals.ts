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
      "id, signal_code, title, summary, created_at, updated_at, signal_statuses!inner(code, name_fi), signal_assessments!inner(is_current, impact_score, relevance_score, confidence_score, novelty_score, primary_sector_id, response_horizon_id, direction_id, sectors(code, name_fi), response_horizons(code, name_fi), directions(code, name_fi))"
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
      "id, signal_code, title, summary, created_at, updated_at, signal_status_id, signal_statuses(code, name_fi), signal_assessments(is_current, impact_score, relevance_score, confidence_score, novelty_score, primary_sector_id, response_horizon_id, direction_id, sectors(code, name_fi), response_horizons(code, name_fi), directions(code, name_fi))"
    )
    .order("updated_at", { ascending: false });

  return (data ?? []).map(mapEmbeddedSignalCard);
}

export async function getSignalDetail(id: string, includeDrafts: boolean): Promise<SignalDetail | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const client = supabase;

  const { data, error } = await client
    .from("signals")
    .select(
      "id, signal_code, title, summary, description, extraction_date, ingestion_method, created_at, updated_at, signal_status_id, signal_statuses(code, name_fi), signal_sources(credibility_score, source_relevance_score, evidence_note, sources(id, title, url, publisher, publication_date, source_type_id, doi, patent_number, notes)), signal_assessments(id, version, is_current, primary_sector_id, response_horizon_id, direction_id, impact_score, uncertainty_score, confidence_score, relevance_score, novelty_score, assessment_rationale, what_if_question, sectors(code, name_fi), response_horizons(code, name_fi), directions(code, name_fi)), signal_themes(themes(id, name, description)), signal_secondary_sectors(sector_id), innovation_implications(id, implication_type_id, title, description, second_order_effects, time_horizon_id, potential_impact_score, actionability_score)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as DbRow;
  const statusCode = text(object(row.signal_statuses), "code");
  if (!includeDrafts && statusCode !== "published") return null;

  const detail = mapSignalDetail(row);
  detail.relationships = await getSignalRelationships(id);
  return detail;

  async function getSignalRelationships(signalId: string) {
    const { data } = await client
      .from("entity_relationships")
      .select(
        "id, target_entity_type, target_entity_id, relationship_type_id, impact_coefficient, strength_score, impact_rationale, relationship_types(code, name_fi)"
      )
      .eq("source_entity_type", "signal")
      .eq("source_entity_id", signalId);

    const relationshipRows = (data ?? []) as unknown as DbRow[];
    const targetSignalIds = relationshipRows
      .filter((item) => text(item, "target_entity_type") === "signal")
      .map((item) => text(item, "target_entity_id"))
      .filter((targetId): targetId is string => Boolean(targetId));

    const targetTitles = new Map<string, string>();
    if (targetSignalIds.length > 0) {
      const { data: targets } = await client.from("signals").select("id, signal_code, title").in("id", targetSignalIds);
      ((targets ?? []) as unknown as DbRow[]).forEach((target) => {
        const targetId = text(target, "id");
        const title = text(target, "title") ?? "";
        const code = text(target, "signal_code");
        if (targetId) targetTitles.set(targetId, code ? `${code} - ${title}` : title);
      });
    }

    return relationshipRows.map((item) => {
      const targetEntityId = text(item, "target_entity_id");
      const relationshipType = object(item.relationship_types);
      return {
        id: text(item, "id") ?? "",
        relationshipTypeId: text(item, "relationship_type_id"),
        relationshipTypeName: text(relationshipType, "name_fi") ?? text(relationshipType, "code"),
        targetEntityType: text(item, "target_entity_type"),
        targetEntityId,
        targetTitle: targetEntityId ? targetTitles.get(targetEntityId) ?? targetEntityId : null,
        strengthScore: number(item, "strength_score"),
        impactCoefficient: number(item, "impact_coefficient"),
        impactRationale: text(item, "impact_rationale")
      };
    });
  }
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
    extractionDate: text(row, "extraction_date"),
    ingestionMethod: text(row, "ingestion_method"),
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
    extractionDate: text(row, "extraction_date"),
    ingestionMethod: text(row, "ingestion_method"),
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
      .map((item) => ({ link: item, source: object(item.sources) }))
      .filter((item): item is { link: DbRow; source: DbRow } => Boolean(item.source))
      .map(({ link, source }) => ({
        id: text(source, "id") ?? "",
        title: text(source, "title"),
        url: text(source, "url"),
        publisher: text(source, "publisher"),
        publicationDate: text(source, "publication_date"),
        sourceTypeId: text(source, "source_type_id"),
        doi: text(source, "doi"),
        patentNumber: text(source, "patent_number"),
        notes: text(source, "notes"),
        credibilityScore: number(link, "credibility_score"),
        sourceRelevanceScore: number(link, "source_relevance_score"),
        evidenceNote: text(link, "evidence_note")
      })),
    themes: rows(row.signal_themes)
      .map((item) => object(item.themes))
      .filter(Boolean)
      .map((theme) => ({ id: text(theme, "id") ?? "", name: text(theme, "name") ?? "", description: text(theme, "description") })),
    secondarySectorIds: rows(row.signal_secondary_sectors)
      .map((item) => text(item, "sector_id"))
      .filter((sectorId): sectorId is string => Boolean(sectorId)),
    implications: rows(row.innovation_implications).map((item) => ({
      id: text(item, "id") ?? "",
      implicationTypeId: text(item, "implication_type_id"),
      title: text(item, "title") ?? "",
      description: text(item, "description"),
      secondOrderEffects: text(item, "second_order_effects"),
      timeHorizonId: text(item, "time_horizon_id"),
      potentialImpactScore: number(item, "potential_impact_score"),
      actionabilityScore: number(item, "actionability_score")
    })),
    relationships: []
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
