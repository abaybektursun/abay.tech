// Data shapes for the meta-analysis blog

export interface VolumeDay {
  date: string;
  total: number;
  valid: number;
  ngram: number;
  invalid_other: number;
}

export interface StrategyCount {
  strategy: string;
  count: number;
}

export interface TechniqueAdoption {
  technique: string;
  total: number;
  from_template: number;
  added: number;
}

export interface NontemplateCount {
  count: number;
  prs: number;
}

export interface TechniqueEffect {
  technique: string;
  n_with: number;
  n_without: number;
  median_with: number;
  median_without: number;
  delta: number;
}

export interface TechniqueScatterPoint {
  n_techniques: number;
  last_val_bpb: number;
  pr_num: number;
}

export interface ParamsPoint {
  params_m: number;
  last_val_bpb: number;
  quant_type: string;
}

export interface BytesPoint {
  bytes_total: number;
  submission_bpb: number;
  quant_type: string;
}

export interface EarlyFinalPoint {
  early: number;
  final: number;
  purity: number | null;
}

export interface SeedConfig {
  pr_num: number;
  config: string;
  n_seeds: number;
  std: number;
  mean: number;
}

export interface NgramTimelinePoint {
  pr_num: number;
  is_ngram: boolean;
  cumulative: number;
  valid: boolean | null;
}

export interface CacheLiftPoint {
  pr_num: number;
  lift: number;
  is_ngram: boolean;
  valid: boolean | null;
}

export interface BackbonePoint {
  last_val_bpb: number;
  is_ngram: boolean;
  valid: boolean | null;
}

export interface InvalidityQuartile {
  quartile: string;
  pr_range: string;
  total: number;
  invalid: number;
  rate: number;
}

export interface ViolationMatrix {
  labels: string[];
  matrix: number[][];
}

export interface BpbDistPoint {
  bpb: number;
  valid: boolean | null;
}

export interface TemptationPoint {
  pr_num: number;
  neural_bpb: number;
  submission_bpb: number;
  lift: number;
}

export interface CurveAtlasRun {
  pr_num: number;
  tier: number;
  points: [number, number][];
}

export interface TechniqueCurve {
  technique: string;
  n_with: number;
  n_without: number;
  gaps: [number, number][];  // [progress%, delta_loss]
}

export interface TaxonomyScatterPoint {
  pr: number;
  val_bpb: number;
  valid: boolean | null;
}
