export type AutomationStatus = "manual" | "semi_automatic" | "automatic";

export type HeadlineCategory = "capability" | "autonomy" | "governance";

export interface SourceReference {
  label: string;
  url: string;
  publisher: string;
  accessedAt: string;
  updateCadence: string;
  automationStatus: AutomationStatus;
}

export interface Criterion {
  id: string;
  name: string;
  score: number;
  weight: number;
  rawValue: string;
  normalization: string;
  source: SourceReference;
  observedAt: string;
  confidence: number;
  notes: string;
}

export interface IndexModule {
  id: string;
  name: string;
  category: HeadlineCategory;
  score: number;
  confidence: number;
  weight: number;
  bottleneck: string;
  summary: string;
  criteria: Criterion[];
}

export interface SnapshotMetadata {
  updatedAt: string;
  period: string;
  methodologyVersion: string;
  summary: string;
}

export type HeadlineConfig = Record<HeadlineCategory, number>;

export interface SeedSnapshot {
  metadata: SnapshotMetadata;
  headlineWeights: HeadlineConfig;
  modules: IndexModule[];
}

export interface HeadlineScores extends HeadlineConfig {
  siliconWorld: number;
}

export interface IndexSnapshot extends SeedSnapshot {
  headlines: HeadlineScores;
}

export type TrendAnnotationType = "data_update" | "methodology_change" | "source_change";

export interface TrendAnnotation {
  type: TrendAnnotationType;
  title: string;
  note: string;
}

export interface HistoryModule {
  id: string;
  name: string;
  category: HeadlineCategory;
  score: number;
  confidence: number;
  bottleneck: string;
  delta: number;
}

export interface HistoryCriterion {
  moduleId: string;
  moduleName: string;
  id: string;
  name: string;
  score: number;
  weight: number;
  confidence: number;
  sourceAutomationStatus: AutomationStatus;
  delta: number;
}

export interface HistoryEntry {
  period: string;
  updatedAt: string;
  methodologyVersion: string;
  headlines: HeadlineScores;
  modules: HistoryModule[];
  criteria: HistoryCriterion[];
  annotations: TrendAnnotation[];
}
