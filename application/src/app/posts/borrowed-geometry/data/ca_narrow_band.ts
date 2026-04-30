// CA Rule 90 length-generalization data, paper Table B.6 + B.2.
// Per-bit error vs sequence length. Random-chance = 0.5.

export interface LengthPoint {
  length: number;
  error: number;
}

export interface Condition {
  id: string;
  label: string;
  highlight?: boolean;
  trainable: string;
  points: LengthPoint[];
}

export const CA_NARROW: { conditions: Condition[]; trainingEdge: number; randomChance: number } = {
  conditions: [
    {
      id: "frozen_gemma",
      label: "Frozen Gemma L24–29",
      highlight: true,
      trainable: "6.1M",
      points: [
        { length: 10, error: 0.0000 },
        { length: 20, error: 0.0001 },
        { length: 30, error: 0.2566 },
        { length: 40, error: 0.3470 },
        { length: 60, error: 0.4194 },
      ],
    },
    {
      id: "trained_transformer",
      label: "Trained Transformer (matched-capacity, lr=1e-4)",
      trainable: "6.36M",
      points: [
        { length: 10, error: 0.0030 },
        { length: 20, error: 0.0217 },
        { length: 30, error: 0.1638 },
        { length: 40, error: 0.2826 },
        { length: 60, error: 0.4329 },
      ],
    },
    {
      id: "lstm_matched",
      label: "LSTM-matched",
      trainable: "6.1M",
      points: [
        { length: 10, error: 0.0003 },
        { length: 20, error: 0.0661 },
        { length: 30, error: 0.2869 },
        { length: 40, error: 0.3519 },
        { length: 60, error: 0.4098 },
      ],
    },
    {
      id: "frozen_random_gpt2",
      label: "FrozenRandom-GPT2 (architecture-alone)",
      trainable: "6.1M",
      points: [
        { length: 10, error: 0.422 },
        { length: 20, error: 0.459 },
        { length: 30, error: 0.474 },
      ],
    },
  ],
  trainingEdge: 20,
  randomChance: 0.5,
};
