export const META = {
  primary: "#264653",    // deep teal
  secondary: "#e07a5f",  // warm coral
  accent: "#81b29a",     // sage green
  amber: "#d4a574",      // muted warm
  purple: "#7c6f8a",     // muted purple
  teal: "#4a9589",       // darker teal
  rose: "#c4616a",       // muted rose
  orange: "#c97b3a",     // muted orange
  muted: "#a1a1aa",      // zinc-400
  gridLine: "#e4e4e7",   // zinc-200
  bg: "#ffffff",
};

export const STRATEGY_COLORS: Record<string, string> = {
  template_technique_stacker: META.primary,
  template_legal_ttt: META.accent,
  template_illegal_ttt: META.secondary,
  ngram_maximizer: META.purple,
  novel_architecture: META.orange,
  early_technique_pioneer: META.teal,
  template_baseline_tuner: META.amber,
  research_ablation: META.muted,
};

export const STRATEGY_LABELS: Record<string, string> = {
  template_technique_stacker: "Technique Stacker",
  template_legal_ttt: "Legal TTT",
  template_illegal_ttt: "Illegal TTT",
  ngram_maximizer: "N-gram Maximizer",
  novel_architecture: "Novel Architecture",
  early_technique_pioneer: "Early Pioneer",
  template_baseline_tuner: "Baseline Tuner",
  research_ablation: "Research/Ablation",
};

export const QUANT_COLORS: Record<string, string> = {
  int6: META.primary,
  int8: META.amber,
  int5: META.teal,
  int4: META.rose,
  ternary: META.purple,
  fp16: META.orange,
  unknown: META.muted,
};

export const PURITY_COLORS: Record<number, string> = {
  0: META.primary,    // strictly pure
  1: META.teal,       // neural+bigramhash
  2: META.amber,      // neural+ttt
  3: META.purple,     // cache_enhanced
};

export const PURITY_LABELS: Record<number, string> = {
  0: "Strictly Pure",
  1: "Neural + BigramHash",
  2: "Neural + TTT",
  3: "Cache Enhanced",
};

export const TIER_COLORS: Record<number, string> = {
  0: META.accent,
  1: META.muted,
  2: META.secondary,
};

export const TIER_LABELS: Record<number, string> = {
  0: "Top 20%",
  1: "Middle 60%",
  2: "Bottom 20%",
};
