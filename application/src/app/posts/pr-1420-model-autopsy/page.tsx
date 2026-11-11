'use client'

import Section from "../pr-1019-model-autopsy/components/Section";
import StatsCard from "../pr-1019-model-autopsy/components/StatsCard";
import InsightCallout from "../pr-1019-model-autopsy/components/InsightCallout";
import RateDistortionChart from "./components/RateDistortionChart";
import RecurrenceChart from "./components/RecurrenceChart";
import SkipGateChart from "./components/SkipGateChart";
import GenerationSamples from "./components/GenerationSamples";
import { PostEyebrowWithProvenance } from "@/components/ui/ai-provenance";

import rateDistortion from "./data/rate_distortion.json";
import recurrence from "./data/recurrence.json";
import skipGates from "./data/skip_gates.json";
import generationSamples from "./data/generation_samples.json";

import "@/styles/globals.css";

export default function PR1420AnalysisPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 pt-6 pb-20 text-zinc-800">

      {/* ─── Header ─── */}
      <header className="mb-10">
        <PostEyebrowWithProvenance ai="pr-1420-model-autopsy">
          <a href="https://github.com/openai/parameter-golf/pull/1420" target="_blank" rel="noopener noreferrer"
            className="underline decoration-zinc-300 hover:text-zinc-700">
            PR #1420
          </a>
          {" "}&middot; April 2026
        </PostEyebrowWithProvenance>
        <h1 className="text-[24px] md:text-[28px] font-semibold leading-snug tracking-tight text-zinc-900 mb-5">
          Autopsy of a Triple-Loop U-Net GPT
        </h1>
        <p className="text-[15px] text-zinc-500 leading-relaxed">
          An 80x range in quantization sensitivity across 67 matrices. Loop layers
          amplify rounding error 2.2x. The third loop pass is clearly worth it
          (contraction ratio 0.634), but a fourth would add only 25% new
          information. All 8 U-Net skip connections are load-bearing &mdash; the
          first encoder loop pass is the most important information source for the
          decoder, with 3&ndash;8x higher skip weight norms than late-layer connections.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8">
          <StatsCard label="Baseline BPB" value="5.520" />
          <StatsCard label="Matrices" value="67" />
          <StatsCard label="Loop Layers" value="4, 5" />
          <StatsCard label="Loop Passes" value="3" unit="(triple)" />
          <StatsCard label="Skip Connections" value="8" unit="U-Net" />
        </div>
      </header>

      <hr className="border-zinc-100 mb-12" />

      {/* ─── Experiment 1: Rate-Distortion ─── */}
      <Section
        id="rate-distortion"
        title="80x Range in Quantization Sensitivity"
        subtitle="Per-matrix rate-distortion: BPB damage per compressed KB"
      >
        <p className="text-sm leading-relaxed text-zinc-600 mb-8">
          For each of the 67 GPTQ-quantized matrices, quantize only that matrix
          (rest stay float32) and measure the BPB increase per compressed KB. This
          &ldquo;pain per byte&rdquo; slope reveals which matrices are the
          bottleneck &mdash; and which can be compressed aggressively for free.
          The most sensitive matrix (block 4 c_v) costs 80x more BPB per byte
          than the least sensitive.
        </p>
        <RateDistortionChart
          matrices={rateDistortion.matrices}
          byType={rateDistortion.by_type}
          loopRatio={rateDistortion.loop_vs_nonloop.ratio}
          baselineBpb={rateDistortion.baseline_bpb}
        />
        <InsightCallout>
          Value projections (c_v) are the most sensitive type at 19.7 x 10⁻⁶
          avg slope &mdash; 5.5x more than queries (c_q) at 3.55 x 10⁻⁶.
          6 of the top 8 most sensitive matrices are in loop layers (4, 5).
          For mixed-precision quantization: give int8 to the top-5 matrices
          and int5 to the bottom-10 to save ~0.005 BPB at the same compressed size.
        </InsightCallout>
      </Section>

      {/* ─── Experiment 2: Recurrence Error Amplification ─── */}
      <Section
        id="recurrence"
        title="Recurrence Amplifies Quantization Error 2.2x"
        subtitle="Block-pair sensitivity + fixed-point convergence analysis"
      >
        <p className="text-sm leading-relaxed text-zinc-600 mb-8">
          Blocks 4&ndash;5 are traversed three times in the triple-loop encoder.
          Does quantization error compound through iterations? We quantize block
          pairs in isolation and compare damage per parameter. The loop pair
          (4, 5) shows 2.2x higher D/Mparam than the average non-loop pair &mdash;
          recurrence amplifies every bit of rounding error.
        </p>
        <RecurrenceChart
          pairResults={recurrence.pair_results}
          convergence={recurrence.convergence}
          amplificationFactor={recurrence.loop_amplification_factor}
        />
        <InsightCallout>
          The contraction ratio of 0.634 means each loop pass changes the
          representation by only 63.4% of what the previous pass changed. Pass 2
          adds 63% of pass 1&apos;s contribution. A hypothetical pass 4 (quad loop)
          would add only 0.634&sup3; = 25% &mdash; not worth the training step
          cost. But pass 3 still adds 40% of what pass 2 does, clearly
          justifying the triple loop. Loop layers need MORE bits in mixed-precision,
          not equal &mdash; the 2.2x amplification means every bit of rounding
          error in layers 4&ndash;5 hurts 2.2x more than in other layers.
        </InsightCallout>
      </Section>

      {/* ─── Experiment 3: Skip Gate Analysis ─── */}
      <Section
        id="skip-gates"
        title="All 8 Skip Connections Are Load-Bearing"
        subtitle="U-Net skip gate values and weight norms"
      >
        <p className="text-sm leading-relaxed text-zinc-600 mb-8">
          The U-Net architecture has 8 skip connections with learned sigmoid
          gates: x_new = lerp(scaled_skip, x_decoder, g). A gate near 0 means
          the encoder skip dominates; near 1 means the decoder ignores the skip.
          If any skip is dead (gate &asymp; 1), it&apos;s free parameter savings.
        </p>
        <SkipGateChart skips={skipGates} />
        <InsightCallout>
          No dead skips. All 8 gates cluster at 0.61&ndash;0.70 (~35% encoder /
          65% decoder blend). The critical finding is in the weight norms: skips
          2&ndash;3 (first encoder loop pass &rarr; decoder) have norms of 21.9
          and 19.5 &mdash; 3&ndash;8x higher than late-layer skips (2.8&ndash;4.2).
          The first loop pass is the dominant information conduit to the decoder.
          The second loop pass (skips 0&ndash;1) has lower norms (6.9&ndash;13.8),
          suggesting it refines rather than establishes the decoder&apos;s input.
        </InsightCallout>
      </Section>

      {/* ─── Further Exploration divider ─── */}
      <hr className="border-zinc-100 mt-8 mb-4" />
      <p className="text-xs tracking-widest uppercase text-zinc-400 mb-12">
        Further Exploration
      </p>

      {/* ─── Generation Samples ─── */}
      <Section
        id="generation-samples"
        title="Reading the Model&apos;s Mind"
        subtitle="50-token prompts from validation data, temp=0.8 — same prompt and seed for both models"
      >
        <p className="text-sm leading-relaxed text-zinc-600 mb-8">
          The most direct form of interpretability: compare what the float32 and
          quantized models generate from identical prompts. Where they agree, the
          quantized representations are faithful. Where they diverge, rounding
          noise has pushed the model into a different region of generation space.
        </p>
        <GenerationSamples
          sequences={generationSamples.sequences}
          promptTokens={generationSamples.metadata.prompt_tokens}
          temperature={generationSamples.metadata.temperature}
        />
        <InsightCallout>
          Both models produce coherent, topically relevant text &mdash; but diverge
          in specific facts and phrasing. Quantization shifts the model into
          parallel narratives rather than producing gibberish. The float32 and
          quantized outputs often share the same opening (Seq 3: identical first
          sentence, Seq 7: same opening clause) before drifting apart. This is
          consistent with the contraction ratio finding: the model converges to
          similar representations, but small quantization perturbations compound
          through autoregressive generation.
        </InsightCallout>
      </Section>

      {/* ─── Conclusions ─── */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Actionable Conclusions</h2>
        <ol className="list-decimal list-inside space-y-4 text-sm leading-relaxed text-zinc-600">
          <li>
            <span className="font-semibold text-zinc-800">
              Mixed-precision quantization is the #1 opportunity.
            </span>{" "}
            The 80x sensitivity range means uniform int6 wastes bits. Giving int8
            to the top-5 matrices (blocks.4.attn.c_v, blocks.5.attn.c_k,
            blocks.0.attn.c_k, blocks.8.attn.c_v, blocks.4.attn.proj) and int5
            to the bottom-10 could save ~0.005 BPB at the same compressed size.
          </li>
          <li>
            <span className="font-semibold text-zinc-800">
              Loop layers need priority in bit allocation.
            </span>{" "}
            The 2.2x amplification factor means every bit of rounding error in
            layers 4&ndash;5 hurts 2.2x more than in other layers. These layers
            should get more bits, not equal.
          </li>
          <li>
            <span className="font-semibold text-zinc-800">
              attn.c_v is the bottleneck type.
            </span>{" "}
            19.7 x 10⁻⁶ avg slope vs 3.55 x 10⁻⁶ for attn.c_q. Value projections
            carry the most quantization-sensitive information. Across the network,
            c_v deserves more bits than c_q.
          </li>
          <li>
            <span className="font-semibold text-zinc-800">
              Triple loop is near-optimal.
            </span>{" "}
            Contraction ratio 0.634. A 4th pass would add only 25% of what the
            3rd adds &mdash; not worth the training step cost. But the 3rd pass
            still adds 63% of what the 2nd does &mdash; clearly worth it.
          </li>
          <li>
            <span className="font-semibold text-zinc-800">
              No skip connections to prune.
            </span>{" "}
            All are active with similar gate values. The U-Net structure is
            load-bearing. The first loop pass is the most important skip source.
          </li>
        </ol>
      </section>

      {/* ─── Footer ─── */}
      <footer className="pt-10 text-center text-xs text-zinc-400 border-t border-zinc-100">
        <p className="font-mono">
          11L GPT, 512d, Triple Loop (4,5), Parallel Residual (7+), U-Net 8-skip, Fused Kernels
        </p>
        <p className="mt-1 font-mono">
          GPTQ int6, Brotli, seed 1234 &middot; Baseline BPB: 5.5203
        </p>
      </footer>
    </div>
  );
}
