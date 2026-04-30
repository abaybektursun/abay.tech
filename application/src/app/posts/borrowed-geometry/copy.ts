// All prose for the Borrowed Geometry post lives here.
// Edit copy here; do not touch components.

export const COPY = {
  hero: {
    eyebrow: "Computational exaptation · April 2026",
    title: "Borrowed Geometry",
    deck:
      "A frozen slice of a 31B-parameter language model beat published SOTA on a robot-manipulation benchmark. The model had only ever been trained on text. The same recipe took the random-init baseline to a 59-point gap on a harder version, then matched Decision Transformer on Walker2d with less than half the trainable parameters. The text in those weights is not just text.",
  },

  // What came out. Every win, ordered by impressiveness.
  results: {
    eyebrow: "what came out",
    items: [
      {
        stat: "+4.33pp",
        headline: "Beating published SOTA on robotic manipulation.",
        body:
          "97.33% on OGBench scene-play-singletask-task1-v0 (Park et al. 2025). Published GCIQL is 93.0%. Three independent seeds, all above 96%, ± 0.74. The substrate is a single frozen Gemma layer wrapped in IQL value/policy heads: 488M frozen parameters that have only ever processed text.",
      },
      {
        stat: "1 → 60%",
        headline: "Architecture without pretraining cannot find the task. The weights find it on their own.",
        body:
          "Same recipe, harder version: cube-double-play-task1. Random-initialized Gemma collapses to ~1% across thirty evaluations. Pretrained Gemma reaches 60% mean. The 59-point gap is the contribution of pretraining alone, with architecture and trainable count held constant.",
      },
      {
        stat: "0.43×",
        headline: "Decision Transformer parity at less than half the trainable parameters.",
        body:
          "Replace Decision Transformer's GPT-2 body with the same frozen Gemma slice. Train only the 521K-parameter wiring. 76.2 ± 0.8 on Walker2d-medium-v2 against Chen et al.'s 74.0, with 0.43× the trainable count. A 28M-parameter standalone student, distilled from the same slice, then beats its own teacher (79.97 vs 78.19) at zero Gemma forward at inference.",
      },
      {
        stat: "8.7×",
        headline: "Pretraining is load-bearing. Not capacity. Not architecture.",
        body:
          "On associative recall at length 30, the frozen Gemma slice plus a 113K-parameter linear interface reaches 0.0505 per-bit error. A 6.36M-parameter from-scratch trained transformer at matched capacity (standard 1/√d_k scaling, two seeds, learning-rate sweep) cannot solve the task. Best per-bit error: 0.4395. Same architectural shape, 56× fewer trainable parameters, frozen weights win by 8.7×. The paper's cleanest pretraining-load-bearing case.",
      },
      {
        stat: "492×",
        headline: "At the edge of the training distribution, a parameter-matched LSTM breaks. The frozen text model holds.",
        body:
          "On cellular automaton Rule 90, at the longest sequence length the trainable interface ever saw during training (still in-distribution, not OOD), the frozen Gemma slice beats a parameter-matched LSTM by 492× and a matched-capacity from-scratch trained transformer by 148× in per-bit error. Same trainable capacity in both controls. The recurrent and the from-scratch transformer baselines plateau at the boundary of where they were trained. The substrate internalizes the distribution.",
      },
    ],
    closing:
      "The rest of this post is how I got here, why it should not have surprised me, and why every larger, better-pretrained model that ships next will sharpen these numbers, not soften them.",
  },

  figures: {
    caRule90:
      "Per-bit error at the training-edge length (L20) on cellular automaton Rule 90, log scale. The trainable interface saw lengths up to L20 during training; this is the longest in-distribution length. Frozen Gemma sits at 0.0001 per-bit error. A from-scratch trained transformer at matched capacity sits 148× higher at 0.0217. A parameter-matched LSTM sits 492× higher at 0.0661. Random chance is 0.5. The substrate is at the boundary of where it was trained; the trainable baselines are at the boundary of what they can learn.",
    exaptation:
      "192 attention heads in Gemma 4 31B's L24–L29 band, scored by two unrelated measurements. Horizontal axis: each head's text-copying signature on 95 random English sentences, as a ratio to the slice mean. Vertical axis: max zero-ablation impact when the head is deleted, across four non-language tasks (copy, associative recall, cellular automaton Rule 90, binary addition). Vermilion: the four named heads where both measurements concentrate.",
    cubeIsolation:
      "Success rate on OGBench cube-double-play-singletask-task1-v0 over 100K training iterations. Three independent seeds per condition; thin lines are per-seed, bold lines are means. Pretrained Gemma at L26 reaches 60% mean. Random-init Gemma at the same depth and shape collapses to ~1%. Architecture without pretraining cannot find this task; pretraining contributes the entire signal.",
    walker2d:
      "Pose driven directly by the policy's qpos at each simulator step. Drag to orbit, scrub the timeline, switch episodes by seed.",
  },

  surprise: {
    title: "The thing that surprised me",
    body: [
      "I started with what looked like a stupid experiment.",
      "A Neural Turing Machine (Graves, Wayne, Danihelka, 2014) is a controller network plus an external read/write memory, end-to-end differentiable. The idea was to give a network a learnable scratchpad. Beautiful. Mostly stopped working at scale a decade ago. The toy benchmarks NTMs were known for were copy, repeat copy, associative recall.",
      "I unhooked the LSTM controller and wired six frozen middle layers of Gemma 4 31B in its place. Not a single weight updated. The point of the test was negative: see how badly a substrate trained only on text would fail at canonical NTM tasks.",
      "It did not fail. On copy, frozen Gemma kept up with a parameter-matched LSTM. On associative recall, it substantially beat one. Frozen Gemma's per-bit error on AR drops below 0.01 within 2k training steps; the original 558K LSTM-NTM never crosses 0.01 in 50k. The frozen text model was solving memory-tape tasks faster than a recurrent network specifically designed for them.",
      "I extended the same shape to one-dimensional cellular automaton Rule 90 and to binary addition: sequence in, sequence out, well-defined per-bit error. On CA Rule 90 at the longest training-edge length, the gap to a parameter-matched LSTM widened to 492×. Same trainable capacity. The LSTM is at its limit at the boundary of where it was trained. The substrate is not.",
      "That turned a one-off experiment into a research project. The supervised lineage was the lever. Why is a frozen text model better at length internalization than a recurrent network trained specifically for the task?",
    ],
  },

  premise: {
    title: "Compute is the asset",
    body: [
      "Training a frontier model is one of the largest industrial undertakings of our time. The smallest open-weight model that matches the frontier costs tens of millions of dollars to train. What you get for that money is weights. There is a claim from Lin, Tegmark, and Rolnick (2017) about those weights I find fascinating without being able to prove: they are a high-fidelity sample of how reality organizes information. The universe is compositional. Deep nets compose. They are good at this for a reason.",
      "Huh, Cheung, Wang, and Isola (2024) make this concrete with the Platonic Representation Hypothesis: networks trained on different modalities, on different data, converge toward measurably similar geometries. The geometries inside a pretrained LLM are not text-geometries. They are reality-geometries, sampled through text.",
      "If that is right, those geometries should be reusable on any task whose structure overlaps reality. Robotics. Memory. Cellular automata. Anywhere compositional structure already lives.",
      "Borrowed geometry.",
    ],
  },

  exaptation: {
    title: "Whose head is which",
    body: [
      "Once the NTM result hooked me, I needed to know what was actually doing the work inside the frozen substrate. So I went looking.",
      "There are 192 attention heads in the band of Gemma I was using. I asked two questions about them, with nothing in common.",
    ],
    q1Label: "Question 1 · text probe",
    q1Body:
      "For 95 random English sentences, score each head on its copying signature: how often it attends to tokens matching the current token's type. Pure text measurement on a frozen text model. Rank the heads.",
    q2Label: "Question 2 · task ablation",
    q2Body:
      "Take those same heads, run binary copy, and zero each head one at a time. Measure which deletions break the task hardest. Rank.",
    punch: "The same heads win both.",
    closing:
      "Across four supervised tasks (copy, associative recall, cellular-automaton patterns, binary addition), the head that breaks the task hardest is the same head the English probe ranks at the top. Four for four.",
    name:
      "Call this computational exaptation, after the biology word for structures selected for one function and repurposed for another without redesign. Bird feathers were thermoregulation before flight.",
  },

  pretraining: {
    title: "Distributed substrate, crystallized specialization",
    body: [
      "There is still a question about what pretraining specifically does with all this structure. Two views compete.",
      "Rumelhart, McClelland, and Hinton (1986) argued that knowledge in neural networks is distributed: spread across many units, individual ablations cause graceful degradation, no one neuron carries any one concept. The modern circuits / superposition view (Elhage 2021, 2022; Olsson 2022) tells a more nuanced story: a high-dimensional distributed substrate with specific computations crystallized into specific identifiable heads.",
      "The empirical shape is the second view. The substrate is high-rank: about half of all singular values are needed to capture 90% of the spectral energy. That is distributed. But specific functions land on specific heads with sharp criticality: zeroing the right head can raise per-bit copy error by +0.244. That is specialized.",
      "The reason borrowed geometry is possible at all is that the substrate has crystallized specialization on top of a distributed base. If pretrained networks were truly fully distributed, you could not name a head and reuse it. There would be nothing to point at.",
    ],
  },

  wins: {
    title: "Three transfers that matter",
    body: [
      "The NTM tests were toy. They told me the substrate was reusable in principle. They did not tell me it could do anything anyone outside my notebook would care about.",
      "So I scaled the recipe.",
    ],
    scenePlay:
      "OGBench scene-play-singletask-task1-v0 is Park et al.'s 2025 goal-conditioned robotic-manipulation benchmark, with continuous state-action vectors. I wrapped a single frozen Gemma layer (488M frozen parameters) in V/Q/π heads for offline IQL. 97.33% ± 0.74 across three seeds. Published GCIQL: 93.0%. Pretrained Gemma at the same depth: 87%. The 4.33-point gap above published is the substrate's contribution net of everything else; the 10.44-point gap above architecture-alone is the contribution of pretraining specifically.",
    cubeDouble:
      "OGBench cube-double-play-task1 is the same setup applied to a harder task. Random-init Gemma fails completely: about 1% across three seeds and thirty evaluations. The same architecture with the pretrained weights reaches 60% mean (across seeds: 96, 88, 0; bimodal). The 59-point gap is the cleanest substrate-isolation measurement in the paper. Architecture without pretraining cannot find this task. The pretrained weights are doing the entire job.",
    walker2d:
      "Walker2d. Replace Decision Transformer's GPT-2 body with the same frozen Gemma slice. Train only the 521K-parameter wiring. 76.2 ± 0.8 across three seeds. Chen et al.'s (2021) Decision Transformer scores 74.0. We match it with 0.43× the trainable parameters. The 5-layer slice (L25–L29, 2.45B frozen) beats the 6-layer baseline by +1.66 with tighter variance. Single-layer compression to 488M frozen is achievable bimodally at favorable seeds. A 28M-parameter standalone student, distilled from the 5L slice with multi-hint Procrustes alignment, then reaches 79.97 normalized score (n=1, replication in flight), beating its own teacher at zero Gemma forward at inference.",
    viewerHint:
      "Pose below is driven directly by the policy's qpos at each simulator step. Drag to orbit. Scrub the timeline.",
    closing: "Three different transfer modalities. Same recipe. The substrate has only ever processed text.",
  },

  whatsInside: {
    title: "What's actually inside",
    body: [
      "Most mechanistic interpretability work targets human understanding: transparency, alignment, safety. I am using the same tools (head probing, attention classification, zero-ablation) for a different end. Not to read what the model is doing. To borrow it.",
      "Gemma 4 31B is the largest Pareto-frontier-class open-weight model. It matches 600B–1T frontier models at roughly 10–30× fewer parameters. It is, in the most literal sense, the floor.",
      "The production frontier (Claude Opus 4.7, GPT-5.5, all the closed-weight ones) is 30–100× more pretraining compute than this. Nobody outside those labs gets to probe their substrates. If compositional structure is universal and pretraining crystallizes specialization on top of it, the geometries inside frontier models are not just bigger. They are denser crystallizations of the same compositional reality, sampled with more compute. If the Platonic Representation Hypothesis is right, they are crystallizing toward each other.",
      "We have no idea what is in there.",
    ],
    closer1: "Whatever it is, it has the same shape.",
    closer2: "Borrowed geometry at production scale is the open question.",
  },

  firstStep: {
    title: "What's left.",
    body: [
      "This is one substrate, on one open-weight scale, on a small subset of tasks. Only Gemma 4 31B was tested; cross-model replication on a second small-and-strong frontier-Elo substrate is the immediate next step. OGBench is singletask-task1 only. The supervised tasks share lineage with the NTM toolkit they came from. Several recent wins sit at n=1 with replication in flight: the standalone-student distillation, the multi-task shared adapter, the AGCN attention-graph extraction.",
      "The mechanism story is partial. The dual-measurement protocol of § 03 classifies the supervised tasks (copy, AR, cellular automaton, addition) cleanly. The robotics wins (scene-play, Walker2d) recruit a different layer the protocol does not see. A unified mechanism that ties the named-head triple to the robotics wins is the immediate next experiment, not a result here.",
      "The point of this program is not these specific numbers. The point is that frozen pretrained weights are a general computational substrate, and the abstract problem-solving geometries inside them are reusable wherever compositional structure already lives. What I have here is the first anchor at one scale. The territory above and around it is open.",
    ],
    caveat:
      "None of this is perfect. The paper documents far more limitations than this section captures: failed cross-modality controls (DINOv2 fails the supervised suite), the Dyck-2 plateau on frozen mid-band weights, the L26 cube-task1 bimodal collapse, several single-seed observations, the cross-model replication that depends on a model class that does not yet exist. They are all in the limitations section and the appendix.",
    paperHref: "https://arxiv.org/abs/XXXX.XXXXX", // TODO: replace with actual arXiv ID
    paperLabel: "Read the paper on arXiv",
  },

  footer: {
    paper: { label: "Paper (PDF)", href: "/papers/borrowed-geometry.pdf" },
    code: {
      label: "Code, raw runs, 141 critical (task, head) pairs",
      href: "https://github.com/abaybektursun/ntm-frozen-gemma",
    },
    contact: { label: "ab@abay.tech", href: "mailto:ab@abay.tech" },
  },
} as const;
