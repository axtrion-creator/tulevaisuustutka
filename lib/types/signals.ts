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
  detectedAt: string | null;
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
  implications: ImplicationSummary[];
};

export type SourceSummary = {
  id: string;
  title: string | null;
  url: string | null;
  publisher: string | null;
  publicationDate: string | null;
  notes: string | null;
};

export type ThemeSummary = {
  id: string;
  name: string;
  description: string | null;
};

export type ImplicationSummary = {
  id: string;
  title: string;
  description: string | null;
  secondOrderEffects: string | null;
  potentialImpactScore: number | null;
  actionabilityScore: number | null;
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
};
