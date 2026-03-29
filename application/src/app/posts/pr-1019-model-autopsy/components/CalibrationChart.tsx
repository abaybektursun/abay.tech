"use client";

import * as Plot from "@observablehq/plot";
import { usePlot } from "./usePlot";

interface CalibrationBin {
  bin_lo: number;
  bin_hi: number;
  count: number;
  pct_tokens: number;
  avg_confidence: number;
  accuracy: number;
  gap: number;
  avg_loss: number;
  pct_loss: number;
}

interface PCorrectBin {
  bin_lo: number;
  bin_hi: number;
  count: number;
  pct_tokens: number;
  avg_p_correct: number;
  avg_loss: number;
  pct_loss: number;
}

interface Props {
  calibrationBins: CalibrationBin[];
  pcorrectBins: PCorrectBin[];
  ece: number;
  overconfidentPctTokens: number;
  overconfidentPctLoss: number;
}

export default function CalibrationChart({
  calibrationBins,
  pcorrectBins,
  ece,
  overconfidentPctTokens,
}: Props) {
  const maxAbsGap = Math.max(...calibrationBins.map((d) => Math.abs(d.gap)));
  const gapDomain = Math.max(maxAbsGap * 1.5, 0.01);

  const reliabilityRef = usePlot(
    (width) =>
      Plot.plot({
        width: Math.min(width, 560),
        height: 420,
        style: { background: "transparent", color: "#71717a", fontSize: "12px" },
        marginLeft: 56,
        marginBottom: 48,
        x: { label: "Mean Confidence (max predicted prob)", domain: [0, 1], grid: true },
        y: { label: "Calibration Gap (accuracy − confidence)", domain: [-gapDomain, gapDomain], grid: true },
        marks: [
          Plot.ruleY([0], { stroke: "#d4d4d8", strokeWidth: 1, strokeDasharray: "6,4" }),
          Plot.rectY(calibrationBins, {
            x1: "bin_lo",
            x2: "bin_hi",
            y: "gap",
            fill: (d: CalibrationBin) => (d.gap < 0 ? "#991b1b" : "#27272a"),
            fillOpacity: 0.4,
            tip: true,
            title: (d: CalibrationBin) =>
              `Confidence: ${(d.avg_confidence * 100).toFixed(1)}%\nAccuracy: ${(d.accuracy * 100).toFixed(1)}%\nGap: ${(d.gap * 100).toFixed(2)}%\nTokens: ${d.pct_tokens.toFixed(1)}%`,
          }),
          Plot.line(calibrationBins, {
            x: "avg_confidence",
            y: "gap",
            stroke: "#27272a",
            strokeWidth: 1.5,
            curve: "catmull-rom",
          }),
          Plot.dot(calibrationBins, {
            x: "avg_confidence",
            y: "gap",
            fill: (d: CalibrationBin) => (d.gap < 0 ? "#991b1b" : "#27272a"),
            r: 3.5,
            stroke: "#f4f4f5",
            strokeWidth: 1.5,
          }),
          Plot.text([`ECE = ${(ece * 100).toFixed(2)}%`], {
            frameAnchor: "top-left",
            dx: 8,
            dy: 8,
            fill: "#27272a",
            fontSize: 12,
            fontWeight: "600",
          }),
          Plot.text(["Underconfident"], {
            frameAnchor: "top-right",
            dx: -8,
            dy: 8,
            fill: "#a1a1aa",
            fontSize: 10,
          }),
          Plot.text(["Overconfident"], {
            frameAnchor: "bottom-right",
            dx: -8,
            dy: -8,
            fill: "#a1a1aa",
            fontSize: 10,
          }),
        ],
      }),
    [calibrationBins, ece, gapDomain]
  );

  const lossRef = usePlot(
    (width) =>
      Plot.plot({
        width: Math.min(width, 560),
        height: 420,
        style: { background: "transparent", color: "#71717a", fontSize: "12px" },
        marginLeft: 56,
        marginBottom: 48,
        x: { label: "P(correct token)", domain: [0, 1] },
        y: { label: "% of Total Loss", grid: true },
        marks: [
          Plot.rectY(pcorrectBins, {
            x1: "bin_lo",
            x2: "bin_hi",
            y: "pct_loss",
            fill: (d: PCorrectBin) => d.avg_p_correct,
            tip: true,
            title: (d: PCorrectBin) =>
              `P(correct): [${d.bin_lo.toFixed(2)}, ${d.bin_hi.toFixed(2)})\nTokens: ${d.pct_tokens.toFixed(1)}%\nLoss share: ${d.pct_loss.toFixed(1)}%\nAvg loss: ${d.avg_loss.toFixed(3)} nats`,
          }),
        ],
        color: {
          type: "linear",
          scheme: "RdYlBu",
          domain: [0, 1],
          reverse: false,
          label: "P(correct)",
          legend: true,
        },
      }),
    [pcorrectBins]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <figure className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
        <div ref={reliabilityRef} className="flex justify-center" />
        <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
          Accuracy − confidence per bin. Zero = perfectly calibrated.
          {overconfidentPctTokens > 50
            ? ` Model is overconfident on ${overconfidentPctTokens.toFixed(0)}% of tokens.`
            : ` Model is underconfident on ${(100 - overconfidentPctTokens).toFixed(0)}% of tokens.`}
        </figcaption>
      </figure>

      <figure className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
        <div ref={lossRef} className="flex justify-center" />
        <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
          Where loss comes from. Low P(correct) = model assigned little probability
          to the right answer — these tokens dominate loss.
        </figcaption>
      </figure>
    </div>
  );
}
