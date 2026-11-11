'use client'

import Section from "./components/Section";
import StatsCard from "./components/StatsCard";
import ChartFigure from "./components/ChartFigure";
import SeriesBanner from "./components/SeriesBanner";
import { PostEyebrowWithProvenance } from "@/components/ui/ai-provenance";

import { TaxonomyScatter } from "./components/TaxonomyScatter";
import { VolumeTimeline } from "./components/meta/VolumeTimeline";
import { StrategyBreakdown } from "./components/meta/StrategyBreakdown";
import { TechniqueAdoptionChart } from "./components/meta/TechniqueAdoptionChart";
import { NontemplateHist } from "./components/meta/NontemplateHist";
import { TechniqueEffectsChart } from "./components/meta/TechniqueEffectsChart";
import { TechniqueScatterChart } from "./components/meta/TechniqueScatterChart";
import { CurveAtlasChart } from "./components/meta/CurveAtlasChart";
import { TechniqueCurvesChart } from "./components/meta/TechniqueCurvesChart";
import { ParamsScatterChart } from "./components/meta/ParamsScatterChart";
import { BytesScatterChart } from "./components/meta/BytesScatterChart";
import { EarlyVsFinalChart } from "./components/meta/EarlyVsFinalChart";
import { SeedVarianceChart } from "./components/meta/SeedVarianceChart";
import { NgramTimelineChart } from "./components/meta/NgramTimelineChart";
import { CacheLiftChart } from "./components/meta/CacheLiftChart";
import { BackboneQualityChart } from "./components/meta/BackboneQualityChart";
import { InvalidityQuartilesChart } from "./components/meta/InvalidityQuartilesChart";
import { ViolationMatrixChart } from "./components/meta/ViolationMatrixChart";
import { BpbDistributionsChart } from "./components/meta/BpbDistributionsChart";
import { TemptationScatterChart } from "./components/meta/TemptationScatterChart";

import volume from "./data/volume_timeline.json";
import strategies from "./data/strategy_breakdown.json";
import techniques from "./data/technique_adoption.json";
import nontemplate from "./data/nontemplate_distribution.json";
import effects from "./data/technique_effects.json";
import techScatter from "./data/technique_scatter.json";
import curveAtlas from "./data/curve_atlas.json";
import techniqueCurves from "./data/technique_curves.json";
import paramsScatter from "./data/params_scatter.json";
import bytesScatter from "./data/bytes_scatter.json";
import earlyFinal from "./data/early_vs_final.json";
import seedVariance from "./data/seed_variance.json";
import ngramTimeline from "./data/ngram_timeline.json";
import cacheLift from "./data/cache_lift.json";
import backbone from "./data/backbone_quality.json";
import invalidity from "./data/invalidity_quartiles.json";
import violationMatrix from "./data/violation_matrix.json";
import bpbDist from "./data/bpb_distributions.json";
import temptation from "./data/temptation_scatter.json";
import taxonomyScatter from "./data/taxonomy_scatter.json";

import "@/styles/globals.css";

export default function MetaPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 pt-6 pb-20 text-zinc-800">

      {/* ─── Series Banner ─── */}
      <SeriesBanner current={1} />

      {/* ─── Header ─── */}
      <header className="mb-10">
        <PostEyebrowWithProvenance ai="pgolf-meta">
          <a href="https://github.com/openai/parameter-golf" target="_blank" rel="noopener noreferrer"
            className="underline decoration-zinc-300 hover:text-zinc-700">
            Parameter Golf
          </a>
          {" "}&middot; 8&times;H100 Track &middot; March 2026
        </PostEyebrowWithProvenance>
        <h1 className="text-[24px] md:text-[28px] font-semibold leading-snug tracking-tight text-zinc-900 mb-5">
          Mining 975 Expensive Training Runs
        </h1>
        <p className="text-[15px] text-zinc-500 leading-relaxed">
          A single 10-minute run on 8&times;H100 SXM GPUs costs roughly
          $40. The Parameter Golf competition produced 975 of
          them&mdash;all public: training logs, source code, checkpoints.
          That&rsquo;s a dataset most of us could never afford to generate.
        </p>
        <p className="text-[15px] text-zinc-500 leading-relaxed mt-3">
          Can you predict how a model will perform on 8&times;H100s
          without actually running 8&times;H100s? From early checkpoints,
          from the source code, from a quick run on a cheaper GPU. This
          article opens up the dataset: what&rsquo;s in it, how much is
          real, and why the answer might be yes.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          <StatsCard label="Submissions" value="409" />
          <StatsCard label="Authors" value="218" />
          <StatsCard label="Valid" value="264" />
          <StatsCard label="Invalid" value="132" />
        </div>
      </header>

      <hr className="border-zinc-100 mb-12" />

      {/* ─── 1. The Dataset ─── */}
      <Section
        id="dataset"
        title="The Dataset"
        subtitle="409 submissions to the 8×H100 track — training logs, source code, and metadata"
      >
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          Each of the 409 submissions comes with training logs, source code,
          and metadata. The metric is validation bits-per-byte (BPB): the
          average number of bits to encode each byte of held-out FineWeb
          data. Lower is better. Not all have complete metadata: 63 lack
          dates, 45 lack author information, and 43 have no parseable
          training logs.
        </p>

        <h3 className="text-[15px] font-semibold text-zinc-900 mt-8 mb-2">
          Classifying 409 submissions
        </h3>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          About 70% of submissions fork a shared template that ships dozens
          of gated features (TTT, N-gram caching, SWA, quantization), all
          toggled by environment variables. The code is there, but most
          features are disabled at runtime. You can&rsquo;t classify a
          submission by reading its code; you have to check what{" "}
          <em>actually ran.</em>
        </p>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          We took inspiration from natural science. First, a Claude agent
          examined PRs like specimens, iteratively building a taxonomy:
          8 strategies, 49 techniques, 5 violation types. Categories
          emerged from observation, not a predefined schema.
        </p>
        <p className="text-sm leading-relaxed text-zinc-600">
          With the taxonomy in hand, a simple script reads each
          submission&rsquo;s source code and training logs, calls an LLM
          once per PR with structured output, and produces tags: strategy,
          active techniques, validity. Final split: 264 valid, 132 invalid,
          13 unauditable.
        </p>
        <ChartFigure caption="Valid submissions form a tight band between 1.02 and 1.25 BPB. Below that: invalid submissions plunging to near-zero BPB, almost entirely N-gram cache and illegal TTT.">
          <TaxonomyScatter data={taxonomyScatter} />
        </ChartFigure>

        <h3 className="text-[15px] font-semibold text-zinc-900 mt-10 mb-2">
          Arrival patterns
        </h3>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          Submissions arrived in waves. The first few days were exploratory.
          Then a shared template appeared, and volume exploded. By day 7,
          N-gram caching arrived and the leaderboard went haywire.
        </p>
        <ChartFigure>
          <VolumeTimeline data={volume} />
        </ChartFigure>
        <p className="text-sm leading-relaxed text-zinc-600 mt-6">
          Eight distinct strategies emerged. Nearly half of all submissions
          were &ldquo;technique stackers&rdquo;&mdash;teams that forked the
          shared template and piled on techniques.
        </p>
        <ChartFigure>
          <StrategyBreakdown data={strategies} />
        </ChartFigure>
      </Section>

      <hr className="border-zinc-100 mb-12" />

      {/* ─── 2. One Template, 975 Experiments ─── */}
      <Section
        id="natural-experiment"
        title="One Template, 975 Experiments"
        subtitle="PR #64 became the foundation for the vast majority of submissions"
      >
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          PR #64, nicknamed &ldquo;Domination,&rdquo; became the foundation
          for the vast majority of submissions. It shipped with a well-tuned
          11-layer transformer and a suite of gated techniques: sliding
          window evaluation, Muon optimizer, int6 quantization, MLP 3&times;,
          SmearGate, and more. Each could be toggled via environment variables.
        </p>
        <p className="text-sm leading-relaxed text-zinc-600">
          Nearly everyone started from the same codebase. That accident
          turns 975 runs into a controlled experiment no individual team
          could have designed. Several non-template techniques became
          just as universal through independent adoption: LeakyReLU&sup2;
          (93%), logit softcap (88%), U-Net skip connections (74%).
        </p>
        <ChartFigure>
          <TechniqueAdoptionChart data={techniques} />
        </ChartFigure>
        <p className="text-sm leading-relaxed text-zinc-600 mt-6">
          The median submission added 7 non-template techniques on top
          of the base. A handful added zero (pure template tuners). A few
          outliers stacked 15+.
        </p>
        <ChartFigure>
          <NontemplateHist data={nontemplate} />
        </ChartFigure>
      </Section>

      <hr className="border-zinc-100 mb-12" />

      {/* ─── 3. What Moved the Needle ─── */}
      <Section
        id="what-moved"
        title="What Moved the Needle"
        subtitle="Filtering to 198 PRs with valid BPB and standard 8×H100 environments"
      >
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          We compare median BPB for submissions <em>with</em> versus{" "}
          <em>without</em> each technique. BigramHash shows the largest
          single-technique association: &minus;0.046 BPB. EMA and XSA follow.
          Int8 quantization is a negative signal; the frontier had moved to
          int6 with QAT, and teams still on int8 were behind the curve.
          These are associations, not causal effects.
        </p>
        <ChartFigure>
          <TechniqueEffectsChart data={effects} />
        </ChartFigure>
        <p className="text-sm leading-relaxed text-zinc-600 mt-6">
          Stacking more techniques helps, but only to a point. Median
          BPB drops from 1.179 (3&ndash;5 techniques) to 1.138
          (12&ndash;14), then flatlines. The correlation is weak
          (r&nbsp;=&nbsp;&minus;0.09) because variance at each level is
          huge. Which techniques you pick matters more than how many.
        </p>
        <ChartFigure>
          <TechniqueScatterChart data={techScatter} />
        </ChartFigure>

        <h3 className="text-[15px] font-semibold text-zinc-900 mt-10 mb-2">
          The 16MB squeeze
        </h3>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          In normal ML, bigger is better. Here, the 16MB artifact limit
          creates a compression frontier. The sweet spot turned out to be
          25&ndash;30M parameters. 71% of the 731 environment-controlled
          runs landed there.
        </p>
        <ChartFigure>
          <ParamsScatterChart data={paramsScatter} />
        </ChartFigure>
        <p className="text-sm leading-relaxed text-zinc-600 mt-6">
          int6 dominates, appearing in 61% of valid submissions. int5 and
          GPTQ variants push compression further, trading precision for
          parameter count.
        </p>
        <ChartFigure>
          <BytesScatterChart data={bytesScatter} />
        </ChartFigure>
      </Section>

      <hr className="border-zinc-100 mb-12" />

      {/* ─── 4. Separating Signal from Noise ─── */}
      <Section
        id="signal-noise"
        title="Separating Signal from Noise"
        subtitle="93% of the 97 N-gram submissions broke the rules"
      >
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          Around PR #659, teams discovered they could precompute N-gram
          statistics from the training data and blend them with neural
          logits at evaluation time. Claimed BPB plummeted from ~1.1 to
          below 0.03. But 93% of the 97 N-gram submissions broke the rules.
        </p>
        <ChartFigure>
          <NgramTimelineChart data={ngramTimeline} />
        </ChartFigure>
        <p className="text-sm leading-relaxed text-zinc-600 mt-6">
          The &ldquo;cache lift&rdquo; tells the story. For N-gram
          submissions, the gap between the neural model&rsquo;s honest BPB
          and the claimed submission BPB is enormous&mdash;the cache is
          doing all the work.
        </p>
        <ChartFigure>
          <CacheLiftChart data={cacheLift} />
        </ChartFigure>
        <p className="text-sm leading-relaxed text-zinc-600 mt-6">
          The neural models <em>underneath</em> the N-gram submissions are
          actually good. Their backbone BPB distribution (median 1.14)
          overlaps with non-N-gram submissions (median 1.16). These were
          talented engineers who chose to game the metric.
        </p>
        <ChartFigure>
          <BackboneQualityChart data={backbone} />
        </ChartFigure>
        <p className="text-sm leading-relaxed text-zinc-600 mt-6">
          It got worse over time. In the first quartile of submissions,
          4% were invalid. By the fourth quartile, 52%&mdash;driven by the
          N-gram explosion.
        </p>
        <ChartFigure>
          <InvalidityQuartilesChart data={invalidity} />
        </ChartFigure>
        <p className="text-sm leading-relaxed text-zinc-600 mt-6">
          Five violation types, often co-occurring. Unnormalized
          distributions dominate (90 PRs).
        </p>
        <ChartFigure>
          <ViolationMatrixChart data={violationMatrix} />
        </ChartFigure>
        <p className="text-sm leading-relaxed text-zinc-600 mt-6">
          For illegal TTT submissions, each point plots a submission&rsquo;s
          honest neural BPB against its claimed BPB. Points below the
          diagonal got an illegal boost.
        </p>
        <ChartFigure>
          <TemptationScatterChart data={temptation} />
        </ChartFigure>
        <p className="text-sm leading-relaxed text-zinc-600 mt-6">
          The full BPB distribution makes the contamination obvious.
          Valid submissions cluster between 1.0 and 1.3. Invalid ones
          spread across the entire range, down to 0.0000 BPB.
        </p>
        <ChartFigure>
          <BpbDistributionsChart data={bpbDist} />
        </ChartFigure>
      </Section>

      <hr className="border-zinc-100 mb-12" />

      {/* ─── 5. The Prediction Signal ─── */}
      <Section
        id="prediction"
        title="The Prediction Signal"
        subtitle="Is training predictable?"
      >
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          Each line below is one training curve from 279
          environment-controlled runs, colored by outcome: green for the
          top 20% of final BPB, red for the bottom 20%.
        </p>
        <ChartFigure caption="Green separates from red in the first quarter. The first-quarter loss drop correlates with final BPB at r = 0.64. The second half of training? Near zero.">
          <CurveAtlasChart data={curveAtlas as any} />
        </ChartFigure>
        <p className="text-sm leading-relaxed text-zinc-600 mt-6">
          Techniques change the shape of the training curve itself. The chart
          below shows the gap in median training loss between runs{" "}
          <em>with</em> vs <em>without</em> each technique, at every point
          during training. Below zero means the technique helps.
        </p>
        <ChartFigure caption="BigramHash helps uniformly. VRL and legal TTT show almost no gap early but widen steadily. Int8 starts in a hole and never climbs out.">
          <TechniqueCurvesChart data={techniqueCurves as any} />
        </ChartFigure>

        <h3 className="text-[15px] font-semibold text-zinc-900 mt-10 mb-2">
          Early signal, final outcome
        </h3>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          Of the 731 environment-controlled runs, 330 logged a validation
          checkpoint near step 1,000&mdash;roughly 90 seconds into a
          10-minute run.
        </p>
        <ChartFigure caption="r = 0.86. After 15% of training, the outcome is largely determined. Pure neural models track the trend line. TTT-augmented models scatter below it.">
          <EarlyVsFinalChart data={earlyFinal} />
        </ChartFigure>
        <p className="text-sm leading-relaxed text-zinc-600 mt-6">
          The random seed barely matters. Across 114 multi-seed
          configurations, the median standard deviation is 0.5 mBPB.
          Architecture choice matters orders of magnitude more than
          random initialization.
        </p>
        <ChartFigure caption="Architecture is what matters, and you can see it 90 seconds in.">
          <SeedVarianceChart data={seedVariance} />
        </ChartFigure>
      </Section>

      <hr className="border-zinc-100 mb-12" />

      {/* ─── Conclusion ─── */}
      <Section
        id="conclusion"
        title="What Comes Next"
        subtitle="Training outcomes are visible at step 1,000"
      >
        <div className="space-y-4 text-sm leading-relaxed text-zinc-600">
          <p>
            After filtering the invalid submissions and building a labeled
            database from what&rsquo;s left, one thing is clear:{" "}
            <strong className="text-zinc-900">
              training outcomes are visible at step 1,000.
            </strong>
          </p>
          <p>
            That&rsquo;s 90 seconds into a 10-minute run. The correlation
            is 0.86. Seed variance is 0.5 mBPB. Architecture choice
            determines the result, and you can see it almost immediately.
          </p>
          <p>
            In <strong className="text-zinc-900">Part 2</strong>, we
            build on this: a model that predicts final BPB from early
            checkpoints&mdash;the 1,000-step oracle. Can you know the
            outcome before the run finishes?
          </p>
          <p>
            In <strong className="text-zinc-900">Part 3</strong>, we go
            further. If early H100 steps predict final H100 outcomes, can
            a short run on an A6000 or RTX 5090 predict what 8&times;H100s
            would produce? If so, you train cheap, predict expensive, and
            only burn H100 time when it counts.
          </p>
        </div>
      </Section>

      {/* ─── Footer ─── */}
      <footer className="pt-10 text-center text-xs text-zinc-400 border-t border-zinc-100">
        <p>
          Data: 409 PRs from the 8&times;H100 SXM track, 975 training logs.
        </p>
        <p className="mt-1">
          Analysis by{" "}
          <a
            href="https://github.com/abaybektursun"
            className="underline decoration-zinc-300 hover:text-zinc-700"
          >
            Abay Bektursun
          </a>
        </p>
      </footer>
    </div>
  );
}
