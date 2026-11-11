'use client'

import Section from "../pr-1019-model-autopsy/components/Section";
import StatsCard from "../pr-1019-model-autopsy/components/StatsCard";
import LogitLensChart from "../pr-1019-model-autopsy/components/LogitLensChart";
import ConditionHeatmap from "../pr-1019-model-autopsy/components/ConditionHeatmap";
import SVCurveViewer from "../pr-1019-model-autopsy/components/SVCurveViewer";
import CrossScatter from "../pr-1019-model-autopsy/components/CrossScatter";
import QuantSensitivityHeatmap from "../pr-1019-model-autopsy/components/QuantSensitivityHeatmap";
import CalibrationChart from "../pr-1019-model-autopsy/components/CalibrationChart";
import AttentionHeadMap from "../pr-1019-model-autopsy/components/AttentionHeadMap";
import LossHeatmap from "../pr-1019-model-autopsy/components/LossHeatmap";
import TopKPredictions from "../pr-1019-model-autopsy/components/TopKPredictions";
import SideBySideGeneration from "../pr-1019-model-autopsy/components/SideBySideGeneration";
import InsightCallout from "../pr-1019-model-autopsy/components/InsightCallout";
import MixedQuantChart from "./components/MixedQuantChart";
import { PostEyebrowWithProvenance } from "@/components/ui/ai-provenance";

import logitLens from "./data/logit_lens.json";
import svdSummary from "./data/svd_summary.json";
import svCurves from "./data/sv_curves.json";
import quantSensitivity from "./data/quant_sensitivity.json";
import calibration from "./data/confidence_calibration.json";
import attentionHeads from "./data/attention_heads.json";
import tokenInterp from "./data/token_interpretability.json";
import mixedQuant from "./data/mixed_quant.json";

import "@/styles/globals.css";

export default function PR1105AnalysisPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 pt-6 pb-20 text-zinc-800">

      {/* ─── Header ─── */}
      <header className="mb-10">
        <PostEyebrowWithProvenance ai="pr-1105-model-autopsy">
          <a href="https://github.com/openai/parameter-golf/pull/1105" target="_blank" rel="noopener noreferrer"
            className="underline decoration-zinc-300 hover:text-zinc-700">
            PR #1105
          </a>
          {" "}&middot; March 2026
        </PostEyebrowWithProvenance>
        <h1 className="text-[24px] md:text-[28px] font-semibold leading-snug tracking-tight text-zinc-900 mb-5">
          Autopsy of a SOTA Parameter-Golf GPT, Round 2
        </h1>
        <p className="text-[15px] text-zinc-500 leading-relaxed">
          The{" "}
          <a href="/posts/pr-1019-model-autopsy" className="underline decoration-zinc-300 hover:text-zinc-700">
            PR #1019 autopsy
          </a>
          {" "}said MLP was 4× more sensitive to quantization than attention.
          So we expanded MLP from 3× to 3.5× and switched to mixed int5/int6.
          Result: 1.1086 BPB, −0.005 over the previous SOTA. The tradeoff:
          calibration ECE jumped from 0.24% to 1.26% — mixed quantization
          introduced systematic overconfidence across 99.6% of tokens.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8">
          <StatsCard label="Sliding BPB" value="1.1086" />
          <StatsCard label="Parameters" value="29.95" unit="M" />
          <StatsCard label="vs PR #1019" value="−0.005" unit="BPB" />
          <StatsCard label="Artifact" value="14.52" unit="MB" />
          <StatsCard label="Hardware" value="8×H100" unit="SXM" />
        </div>
      </header>

      <hr className="border-zinc-100 mb-12" />

      {/* MLP Still Dominates Quant Sensitivity */}
      <Section
        id="quant-sensitivity"
        title="MLP Still Dominates — But the Gap Narrowed"
        subtitle="Per-matrix int6 sensitivity, same methodology as PR #1019"
      >
        <p className="text-sm leading-relaxed text-zinc-600 mb-8">
          Same test: quantize each matrix individually to int6, keep everything
          else at full precision. MLP_down accounts for 1,302 × 10⁻⁶ total
          sensitivity. All four attention matrix types combined: 599 × 10⁻⁶.
          The ratio dropped from 4× to 2.2× — the wider MLP spreads
          quantization damage across more parameters, making each individual
          weight less critical.
        </p>
        <QuantSensitivityHeatmap
          perMatrix={quantSensitivity.per_matrix}
          perLayer={quantSensitivity.per_layer}
          baselineBpb={quantSensitivity.baseline_bpb}
          fullModelDelta={quantSensitivity.full_model_int6_delta}
        />
        <InsightCallout>
          Layer 9 is now the most sensitive (+403 × 10⁻⁶), overtaking
          Layer 10 from PR #1019. Full-model int6 penalty: +0.0023 BPB, down
          from +0.0083 in PR #1019. The wider MLP and mixed quantization
          strategy are working — less total damage per bit removed.
        </InsightCallout>
      </Section>

      {/* Mixed Precision: int5 vs int6 */}
      <Section
        id="mixed-quant"
        title="Mixed Precision: Where the Extra Bit Matters"
        subtitle="Per-matrix int5 vs int6 — the knapsack that makes 3.5× MLP fit in 16 MB"
      >
        <p className="text-sm leading-relaxed text-zinc-600 mb-8">
          Uniform int6 can&apos;t fit 29.95M parameters under 16 MB. The
          fix: default to int5 and selectively
          promote matrices where the extra bit pays for itself. Every single
          top-10 upgrade benefit is an MLP_down matrix. L9 MLP_down gains
          1,167 × 10⁻⁶ BPB from one extra bit. L10 MLP_down: 1,066 × 10⁻⁶.
          The next non-MLP_down entry is L9 V at rank #11. The efficiency
          ranking (BPB gain per bit spent) feeds the knapsack that decides the
          final allocation.
        </p>
        <MixedQuantChart
          perMatrix={mixedQuant.per_matrix}
          baselineBpb={mixedQuant.baseline_bpb}
        />
        <InsightCallout>
          Across all 66 matrices: MLP_down accounts for 6,058 × 10⁻⁶ of
          total upgrade benefit — 70% of the entire budget. MLP_up adds
          1,541 × 10⁻⁶ (18%). All attention matrices combined: 1,065 × 10⁻⁶
          (12%). 11 matrices show negative upgrade benefits (int5 actually
          outperforms int6) — concentrated in V and K matrices at layers 1–3
          and 7–8. L3 V is the most negative at −118 × 10⁻⁶. At these
          magnitudes this is likely eval noise, but it means promoting those
          matrices would waste bits and hurt BPB.
        </InsightCallout>
      </Section>

      {/* Condition Number Still Misleading */}
      <Section
        id="svd"
        title="Condition Numbers: Still a Red Herring"
        subtitle="Q up to 30,759, Out up to 25,556 — MLP still hurts more"
      >
        <p className="text-sm leading-relaxed text-zinc-600 mb-8">
          Q&apos;s condition number dropped from 54,000 to 30,759 with the
          wider MLP, but the story is the same: high condition number does not
          predict quantization sensitivity. MLP matrices have condition numbers
          of 4–13 and dominate the damage. Stable rank remains the real
          predictor — MLP utilizes 95% of its rank capacity vs 73% for Q.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ConditionHeatmap matrices={svdSummary.matrices} />
          <CrossScatter
            probePoints={logitLens.probe_points}
            matrices={svdSummary.matrices}
          />
        </div>
        <InsightCallout>
          MLP rank utilization: 95.2% (up from 94.4% in PR #1019). At 3.5×
          expansion the MLP is nearly fully packed. Further expansion would
          add parameters that actually get used. Q utilization at 73.3% means
          attention still has headroom — it&apos;s not parameter-starved.
        </InsightCallout>
      </Section>

      {/* Stable Rank */}
      <Section
        id="stable-rank"
        title="Stable Rank Explains the Gap"
        subtitle="Why low condition numbers hurt more than high ones"
      >
        <p className="text-sm leading-relaxed text-zinc-600 mb-8">
          The singular value curves show the mechanism: Q concentrates energy
          in ~12% of its channels. The other 88% carry near-zero signal, so
          quantization errors there are harmless. MLP uses ~35% of its
          channels — 3× more active capacity, 3× more ways to accumulate
          rounding damage. Same pattern as PR #1019, now with wider matrices.
        </p>
        <SVCurveViewer curves={svCurves.curves} />
        <InsightCallout>
          The 3.5× MLP increased MLP stable rank from ~160 to ~184 on average.
          More channels are active, but the utilization ratio (stable rank /
          full rank) held steady at ~95%. The expansion added capacity that
          the model actually uses — not dead parameters.
        </InsightCallout>
      </Section>

      {/* Logit Lens */}
      <Section
        id="logit-lens"
        title="Layer 7 Still Does Most of the Work"
        subtitle="Projecting each layer's residual stream through the unembedding matrix"
      >
        <p className="text-sm leading-relaxed text-zinc-600 mb-8">
          Same logit lens methodology. Layer 7 contributes −3.82 bits/token
          (vs −4.35 in PR #1019). Layers 3–5 still show increased loss from
          skip connection reorganization. The pattern is structurally identical
          to PR #1019 despite the wider MLP and different quantization.
        </p>
        <LogitLensChart
          probePoints={logitLens.probe_points}
          numEncoderLayers={logitLens.architecture.num_encoder_layers}
        />
        <InsightCallout>
          Layer 7: −3.82 bits/token. Layer 10: −0.52 bits/token, still the
          weakest contributor. The encoder layers 3–4 readability cost is
          larger here (+1.22, +0.99, +2.24 for L3–L5) vs PR #1019, suggesting
          the wider MLP is pushing more representational work through the skip
          connections.
        </InsightCallout>
      </Section>

      {/* Calibration Degraded */}
      <Section
        id="calibration"
        title="Calibration Degraded: The Cost of Mixed Quantization"
        subtitle={`ECE = ${(calibration.ece * 100).toFixed(2)}% — up from 0.24% in PR #1019`}
      >
        <p className="text-sm leading-relaxed text-zinc-600 mb-8">
          ECE jumped 5× from 0.24% to 1.26%. 99.6% of tokens land in
          overconfident bins — the model consistently believes it&apos;s more
          right than it is. This is a direct consequence of mixed int5/int6:
          the coarser int5 matrices introduce systematic confidence bias that
          uniform int6 did not.
        </p>
        <CalibrationChart
          calibrationBins={calibration.calibration_bins}
          pcorrectBins={calibration.pcorrect_bins}
          ece={calibration.ece}
          overconfidentPctTokens={calibration.overconfident_pct_tokens}
          overconfidentPctLoss={calibration.overconfident_pct_loss}
        />
        <InsightCallout>
          The BPB gain from mixed quantization (-0.005) is worth the
          calibration cost — but this model would benefit from temperature
          scaling, unlike PR #1019. 70% of total loss still comes from tokens
          where P(correct) {"<"} 5%. The bottleneck is still accuracy, but
          confidence is now slightly misaligned.
        </InsightCallout>
      </Section>

      {/* Further Exploration divider */}
      <hr className="border-zinc-100 mt-8 mb-4" />
      <p className="text-xs tracking-widest uppercase text-zinc-400 mb-12">
        Further Exploration
      </p>

      {/* Attention Heads */}
      <Section
        id="attention-heads"
        title="What Each Head Learns"
        subtitle={`Classifying ${attentionHeads.heads.length} attention heads by function`}
      >
        <p className="text-sm leading-relaxed text-zinc-600 mb-8">
          28 previous-token heads (vs 22 in PR #1019), 1 induction head (down
          from 2), and 2 positional heads (new). The wider MLP didn&apos;t
          change the fundamental attention patterns — this model still relies
          on n-gram statistics, not in-context copying.
        </p>
        <AttentionHeadMap
          heads={attentionHeads.heads}
          summary={attentionHeads.summary}
        />
        <InsightCallout>
          The single induction head (L2H3, score 0.020) is marginal.
          28 previous-token heads split evenly between encoder (15) and
          decoder (13). The emergence of 2 positional heads in the decoder
          (L6H2, L6H3) is new — these attend to absolute position, possibly
          compensating for the larger MLP&apos;s representational demands.
        </InsightCallout>
      </Section>

      {/* Token-Level Interpretability */}
      {tokenInterp.sequences.length > 0 && (
        <Section
          id="token-interpretability"
          title="Reading the Model&apos;s Mind"
          subtitle="Token-level loss, top-k predictions at failure points, and generation vs. reality"
        >
          <p className="text-sm leading-relaxed text-zinc-600 mb-8">
            Individual tokens, failure points, alternative predictions, and
            free-form generation compared against ground truth.
          </p>
          <div className="space-y-6">
            <LossHeatmap
              sequences={tokenInterp.sequences}
              lossThreshold={tokenInterp.metadata.loss_threshold_nats}
            />
            <TopKPredictions sequences={tokenInterp.sequences} />
            <SideBySideGeneration
              sequences={tokenInterp.sequences}
              promptLen={tokenInterp.metadata.prompt_len}
              genLen={tokenInterp.metadata.gen_len}
              temperature={tokenInterp.metadata.temperature}
            />
          </div>
        </Section>
      )}

      {/* What Changed */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">What Changed from PR #1019</h2>
        <p className="text-sm leading-relaxed text-zinc-600 mb-6">
          Expanding MLP was the right call — stable rank confirmed it was
          parameter-starved. Mixed quantization bought us the bit budget to
          fit the larger model under 16 MB. The calibration hit is real but
          recoverable with temperature scaling.
        </p>
        <ol className="list-decimal list-inside space-y-3 text-sm leading-relaxed text-zinc-600">
          <li>
            <span className="font-semibold text-zinc-800">MLP 3× → 3.5× worked.</span>{" "}
            SVD showed 94.4% rank utilization at 3× — nearly packed. At 3.5×
            it&apos;s 95.2% and still climbing. The extra 2.88M parameters are
            active.
          </li>
          <li>
            <span className="font-semibold text-zinc-800">Mixed int5/int6 fits the budget.</span>{" "}
            The per-matrix
            analysis shows MLP_down captures 70% of total upgrade benefit.
            Promote MLP_down first, then MLP_up, then attention if bits remain.
          </li>
          <li>
            <span className="font-semibold text-zinc-800">Calibration is now a concern.</span>{" "}
            ECE: 0.24% → 1.26%. Temperature scaling was unnecessary before.
            It&apos;s worth investigating now.
          </li>
          <li>
            <span className="font-semibold text-zinc-800">Layer 9 overtook Layer 10</span>{" "}
            as the most quantization-sensitive layer (+403 vs +229 × 10⁻⁶).
            If narrowing a layer, L10 is still the candidate — low logit lens
            contribution (−0.52 bits/token) with high sensitivity.
          </li>
        </ol>
      </section>

      {/* Footer */}
      <footer className="pt-10 text-center text-xs text-zinc-400 border-t border-zinc-100">
        <p className="font-mono">
          11L GPT, 512d, 8H/4KV GQA, XSA-all, BigramHash 3072×112, MLP 3.5×, LeakyReLU(0.5)²
        </p>
        <p className="mt-1 font-mono">
          Mixed int5/int6 GPTQ, Brotli-11, Parallel Muon NS5, 8×H100 SXM, seed 314
        </p>
      </footer>
    </div>
  );
}
