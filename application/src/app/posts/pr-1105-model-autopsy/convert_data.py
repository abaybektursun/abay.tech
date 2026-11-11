#!/usr/bin/env python3
"""Convert analysis .txt reports to JSON for the blog post components."""
import json, re, shutil
from pathlib import Path

SRC = Path("/Users/abaybektursun/projects/parameter-golf/experiments/model_analysis_mlp35_mixed")
DST = Path(__file__).parent / "data"
DST.mkdir(exist_ok=True)

# ─── 1. logit_lens.json ───
lines = (SRC / "logit_lens.txt").read_text().splitlines()
probe_points = []
for line in lines:
    m = re.match(r'\s*(embed|layer_(\d+)|final)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)%\s*(.*)', line)
    if not m:
        continue
    label, layer_num, loss_nats, bits_per_token, top1_acc, delta_str = m.groups()
    layer_idx = -1 if label == "embed" else (11 if label == "final" else int(layer_num))
    delta = None if delta_str.strip() == "" else float(delta_str.strip())
    is_encoder = layer_idx >= 0 and layer_idx <= 4
    is_decoder = layer_idx >= 5 and layer_idx <= 10
    probe_points.append({
        "label": label,
        "layer_idx": layer_idx,
        "loss_nats": float(loss_nats),
        "bits_per_token": float(bits_per_token),
        "top1_accuracy": float(top1_acc) / 100,
        "delta_bits_per_token": delta,
        "is_encoder": is_encoder,
        "is_decoder": is_decoder,
    })

logit_lens = {
    "probe_points": probe_points,
    "architecture": {
        "num_layers": 11,
        "num_encoder_layers": 5,
        "num_decoder_layers": 6,
        "skip_connections": [
            {"from_encoder": 3, "to_decoder": 6},
            {"from_encoder": 4, "to_decoder": 5},
        ],
    },
}
(DST / "logit_lens.json").write_text(json.dumps(logit_lens, indent=2))
print(f"logit_lens.json: {len(probe_points)} probe points")

# ─── 2. svd_summary.json ───
lines = (SRC / "svd.txt").read_text().splitlines()
matrices = []
for line in lines:
    m = re.match(r'\s*(L\d+_\w+|bigram\.\w+\.\w+|tok_emb\.\w+|ve_shared\.\w+\.\w+)\s+(\d+)x(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+(\d+)', line)
    if not m:
        continue
    label = m.group(1)
    shape = [int(m.group(2)), int(m.group(3))]
    rank99, rank95 = int(m.group(4)), int(m.group(5))
    stable_rank = float(m.group(6))
    sv_max, sv_min = float(m.group(7)), float(m.group(8))
    cond = int(m.group(9))

    # Determine layer and type
    layer_m = re.match(r'L(\d+)_(Q|K|V|Out|MLP_up|MLP_down)', label)
    if layer_m:
        layer = int(layer_m.group(1))
        mtype = layer_m.group(2)
    else:
        layer = -1
        mtype = "other"

    matrices.append({
        "label": label,
        "layer": layer,
        "type": mtype,
        "shape": shape,
        "eff_rank_99": rank99,
        "eff_rank_95": rank95,
        "stable_rank": stable_rank,
        "sv_max": sv_max,
        "sv_min": sv_min,
        "condition_number": cond,
    })

(DST / "svd_summary.json").write_text(json.dumps({"matrices": matrices}, indent=2))
print(f"svd_summary.json: {len(matrices)} matrices")

# ─── 3. quant_sensitivity.json ───
lines = (SRC / "quant_sensitivity.txt").read_text().splitlines()
baseline_bpb = None
full_model_int6_delta = None
per_matrix = []
per_layer = []

for line in lines:
    m = re.match(r'Baseline BPB.*?:\s*([\d.]+)', line)
    if m:
        baseline_bpb = float(m.group(1))
    m = re.match(r'\s*Full model int6.*?Δ=\+([\d.]+)', line)
    if m:
        full_model_int6_delta = float(m.group(1))
    # Per-matrix: "  L 0 Q          BPB=1.150977  Δ=+0.000011"
    m = re.match(r'\s+L\s*(\d+)\s+(Q|K|V|Out|MLP_up|MLP_down)\s+BPB=([\d.]+)\s+Δ=([+-][\d.]+)', line)
    if m:
        per_matrix.append({
            "layer": int(m.group(1)),
            "type": m.group(2),
            "bpb": float(m.group(3)),
            "delta": float(m.group(4)),
        })
    # Per-layer: "  Layer  0: BPB=1.151059  Δ=+0.000093"
    m = re.match(r'\s+Layer\s+(\d+):\s+BPB=([\d.]+)\s+Δ=\+([\d.]+)', line)
    if m:
        per_layer.append({
            "layer": int(m.group(1)),
            "bpb": float(m.group(2)),
            "delta": float(m.group(3)),
        })

quant = {
    "baseline_bpb": baseline_bpb,
    "full_model_int6_bpb": baseline_bpb + full_model_int6_delta,
    "full_model_int6_delta": full_model_int6_delta,
    "per_matrix": per_matrix,
    "per_layer": per_layer,
}
(DST / "quant_sensitivity.json").write_text(json.dumps(quant, indent=2))
print(f"quant_sensitivity.json: {len(per_matrix)} matrices, {len(per_layer)} layers")

# ─── 4. confidence_calibration.json ───
lines = (SRC / "confidence_calibration.txt").read_text().splitlines()
calibration_bins = []
pcorrect_bins = []
rank_histogram = []
type_ece = []
overall_accuracy = None
overall_bpb = None
mean_entropy_nats = None
ece = None
overconfident_pct_tokens = None
overconfident_pct_loss = None
underconfident_pct_tokens = None
underconfident_pct_loss = None
total_tokens = None

section = None
for line in lines:
    m = re.match(r'Total tokens:\s+([\d,]+)', line)
    if m:
        total_tokens = int(m.group(1).replace(",", ""))
    m = re.match(r'Overall top-1 accuracy:\s+([\d.]+)%', line)
    if m:
        overall_accuracy = float(m.group(1)) / 100
    m = re.match(r'Overall BPB:\s+([\d.]+)', line)
    if m:
        overall_bpb = float(m.group(1))
    m = re.match(r'Mean prediction entropy:\s+([\d.]+)\s+nats\s+\(([\d.]+)\s+bits\)', line)
    if m:
        mean_entropy_nats = float(m.group(1))
        mean_entropy_bits = float(m.group(2))
    m = re.match(r'Expected Calibration Error \(ECE\):\s+([\d.]+)', line)
    if m:
        ece = float(m.group(1))

    # Calibration bins: "  [0.00,0.05)      218,710      0.35%     0.0437..."
    m = re.match(r'\s+\[([\d.]+),([\d.]+)\)\s+([\d,]+)\s+([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s+([+-][\d.]+)\s+([\d.]+)\s+([\d.]+)%', line)
    if m and section != "pcorrect":
        calibration_bins.append({
            "bin_lo": float(m.group(1)), "bin_hi": float(m.group(2)),
            "count": int(m.group(3).replace(",", "")),
            "pct_tokens": float(m.group(4)),
            "avg_confidence": float(m.group(5)), "accuracy": float(m.group(6)),
            "gap": float(m.group(7)), "avg_loss": float(m.group(8)),
            "pct_loss": float(m.group(9)),
        })

    if "P(correct)" in line and "Count" in line:
        section = "pcorrect"

    # P(correct) bins
    m2 = re.match(r'\s+\[([\d.]+),([\d.]+)\)\s+([\d,]+)\s+([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)%', line)
    if m2 and section == "pcorrect":
        pcorrect_bins.append({
            "bin_lo": float(m2.group(1)), "bin_hi": float(m2.group(2)),
            "count": int(m2.group(3).replace(",", "")),
            "pct_tokens": float(m2.group(4)),
            "avg_p_correct": float(m2.group(5)),
            "avg_loss": float(m2.group(6)),
            "pct_loss": float(m2.group(7)),
        })

    if "Rank" in line and "Count" in line and "Cumulative" in line:
        section = "rank"

    # Rank histogram
    m3 = re.match(r'\s+(\d+\+?)\s+([\d,]+)\s+([\d.]+)%\s+([\d.]+)%', line)
    if m3 and section == "rank":
        rank_histogram.append({
            "rank": m3.group(1),
            "count": int(m3.group(2).replace(",", "")),
            "pct": float(m3.group(3)),
            "cumulative": float(m3.group(4)),
        })

    if "Type" in line and "ECE" in line and "Accuracy" in line:
        section = "type_ece"

    m4 = re.match(r'(word|punct|number|whitespace|other)\s+([\d.]+)\s+([\d.]+)%', line)
    if m4 and section == "type_ece":
        type_ece.append({
            "type": m4.group(1),
            "ece": float(m4.group(2)),
            "accuracy": float(m4.group(3)) / 100,
        })

    m5 = re.match(r'\s+Tokens:\s+([\d,]+)\s+\(([\d.]+)%\)', line)
    if m5:
        if "Overconfident" in lines[lines.index(line) - 1] if lines.index(line) > 0 else "":
            overconfident_pct_tokens = float(m5.group(2))
        # Just track both
    m6 = re.match(r'\s+Loss:\s+\d+\s+nats\s+\(([\d.]+)%\)', line)
    if m6:
        pass

# Extract overconfident/underconfident from the raw lines
for i, line in enumerate(lines):
    if "Overconfident bins" in line:
        m = re.search(r'Tokens:.*?\(([\d.]+)%\)', lines[i+1]) if i+1 < len(lines) else None
        if m:
            overconfident_pct_tokens = float(m.group(1))
        m = re.search(r'Loss:.*?\(([\d.]+)%\)', lines[i+2]) if i+2 < len(lines) else None
        if m:
            overconfident_pct_loss = float(m.group(1))
    if "Underconfident bins" in line:
        m = re.search(r'Tokens:.*?\(([\d.]+)%\)', lines[i+1]) if i+1 < len(lines) else None
        if m:
            underconfident_pct_tokens = float(m.group(1))
        m = re.search(r'Loss:.*?\(([\d.]+)%\)', lines[i+2]) if i+2 < len(lines) else None
        if m:
            underconfident_pct_loss = float(m.group(1))

cal = {
    "total_tokens": total_tokens,
    "overall_accuracy": overall_accuracy,
    "overall_bpb": overall_bpb,
    "mean_entropy_nats": mean_entropy_nats,
    "mean_entropy_bits": mean_entropy_bits,
    "ece": ece,
    "calibration_bins": calibration_bins,
    "pcorrect_bins": pcorrect_bins,
    "rank_histogram": rank_histogram,
    "type_ece": type_ece,
    "overconfident_pct_tokens": overconfident_pct_tokens,
    "overconfident_pct_loss": overconfident_pct_loss,
    "underconfident_pct_tokens": underconfident_pct_tokens,
    "underconfident_pct_loss": underconfident_pct_loss,
}
(DST / "confidence_calibration.json").write_text(json.dumps(cal, indent=2))
print(f"confidence_calibration.json: {len(calibration_bins)} cal bins, {len(pcorrect_bins)} pcorrect bins, ECE={ece}")

# ─── 5. attention_heads.json ───
lines = (SRC / "attention_heads.txt").read_text().splitlines()
heads = []
summary_line = None

for line in lines:
    m = re.match(r'\s+(L\d+)\s+(H\d+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+(\w+)', line)
    if m:
        layer = int(m.group(1)[1:])
        head = int(m.group(2)[1:])
        heads.append({
            "layer": layer,
            "head": head,
            "prev_token_score": float(m.group(3)),
            "induction_score": float(m.group(4)),
            "bos_score": float(m.group(5)),
            "entropy": float(m.group(6)),
            "self_attn_score": float(m.group(7)),
            "offset_scores": [float(m.group(i)) for i in range(8, 13)],
            "classification": m.group(13),
        })

# Count classifications
induction_count = sum(1 for h in heads if h["classification"] == "induction")
prev_token_count = sum(1 for h in heads if h["classification"] == "previous_token")
positional_count = sum(1 for h in heads if h["classification"] == "positional")
other_count = sum(1 for h in heads if h["classification"] == "other")

attn = {
    "heads": heads,
    "summary": {
        "induction_count": induction_count,
        "prev_token_count": prev_token_count,
        "positional_count": positional_count,
        "other_count": other_count,
    },
}
(DST / "attention_heads.json").write_text(json.dumps(attn, indent=2))
print(f"attention_heads.json: {len(heads)} heads ({induction_count} induction, {prev_token_count} prev_token, {positional_count} positional)")

# ─── 6. loss_decomposition.json ───
lines = (SRC / "loss_decomposition.txt").read_text().splitlines()
overall_bpb_loss = None
total_bytes = None
mean_entropy = None
buckets = []

for line in lines:
    m = re.match(r'Overall BPB:\s+([\d.]+)\s+\(total_bytes:\s+(\d+)\)', line)
    if m:
        overall_bpb_loss = float(m.group(1))
        total_bytes = int(m.group(2))
    m = re.match(r'Mean prediction entropy:\s+([\d.]+)\s+nats', line)
    if m:
        mean_entropy = float(m.group(1))
    m = re.match(r'(freq_\w+|pos_\w+|type_\w+)\s+([\d.]+)\s+([\d.]+)%\s+([\d.]+)%', line)
    if m:
        name = m.group(1)
        dimension = name.split("_")[0]
        dim_map = {"freq": "frequency", "pos": "position", "type": "type"}
        buckets.append({
            "dimension": dim_map[dimension],
            "name": name,
            "bpb": float(m.group(2)),
            "pct_bytes": float(m.group(3)),
            "pct_loss": float(m.group(4)),
        })

loss_decomp = {
    "overall_bpb": overall_bpb_loss,
    "total_bytes": total_bytes,
    "mean_entropy_nats": mean_entropy,
    "buckets": buckets,
}
(DST / "loss_decomposition.json").write_text(json.dumps(loss_decomp, indent=2))
print(f"loss_decomposition.json: {len(buckets)} buckets")

# ─── 7. training_log.json (minimal from known metadata) ───
training_log = {
    "metadata": {
        "total_steps": 7000,
        "step_avg_ms": 85.7,
        "final_val_bpb": 1.1086,
        "model_params": 29950000,
        "hardware": "8×H100 SXM",
        "seed": 314,
    },
    "events": [],
    "steps": [],
}
(DST / "training_log.json").write_text(json.dumps(training_log, indent=2))
print("training_log.json: metadata only")

# ─── 8. Copy token_interpretability.json ───
src_ti = SRC / "token_interpretability.json"
dst_ti = DST / "token_interpretability.json"
shutil.copy2(src_ti, dst_ti)
print(f"token_interpretability.json: copied ({src_ti.stat().st_size // 1024} KB)")

print("\nDone! All data files written to", DST)
