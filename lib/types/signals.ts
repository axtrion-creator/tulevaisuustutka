export type Profile = {
  id: string;
  role: "admin" | "viewer";
  fullName: string | null;
};

export type SignalCard = {
  id: string;
  code: string | null;
  title: string;
  summary: string;
  statusId: string | null;
  statusCode: string | null;
  statusName: string | null;
  sectorId: string | null;
  sectorCode: string | null;
  sectorName: string | null;
  horizonId: string | null;
  horizonCode: string | null;
  horizonName: string | null;
  directionId: string | null;
  directionCode: string | null;
  directionName: string | null;
  impactScore: number | null;
  relevanceScore: number | null;
  confidenceScore: number | null;
  noveltyScore: number | null;
  extractionDate?: string | null;
  ingestionMethod?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type SignalDetail = SignalCard & {
  description: string | null;
  uncertaintyScore: number | null;
  assessmentRationale: string | null;
  whatIfQuestion: string | null;
  sources: SourceSummary[];
  themes: ThemeSummary[];
  secondarySectorIds: string[];
  implications: ImplicationSummary[];
  relationships: RelationshipSummary[];
};

export type SourceSummary = {
  id: string;
  title: string | null;
  url: string | null;
  publisher: string | null;
  publicationDate: string | null;
  sourceTypeId: string | null;
  doi: string | null;
  patentNumber: string | null;
  notes: string | null;
  credibilityScore: number | null;
  sourceRelevanceScore: number | null;
  evidenceNote: string | null;
};

export type ThemeSummary = {
  id: string;
  name: string;
  description: string | null;
};

export type ImplicationSummary = {
  id: string;
  implicationTypeId: string | null;
  title: string;
  description: string | null;
  secondOrderEffects: string | null;
  timeHorizonId: string | null;
  potentialImpactScore: number | null;
  actionabilityScore: number | null;
};

export type RelationshipSummary = {
  id: string;
  relationshipTypeId: string | null;
  relationshipTypeName: string | null;
  targetEntityType: string | null;
  targetEntityId: string | null;
  targetTitle: string | null;
  strengthScore: number | null;
  impactCoefficient: number | null;
  impactRationale: string | null;
};

export type LookupOption = {
  id: string;
  code: string;
  label: string;
};

export type LookupOptions = {
  sectors: LookupOption[];
  responseHorizons: LookupOption[];
  directions: LookupOption[];
  statuses: LookupOption[];
  sourceTypes: LookupOption[];
  implicationTypes: LookupOption[];
  timeHorizons: LookupOption[];
  relationshipTypes: LookupOption[];
  signalTargets: LookupOption[];
};
