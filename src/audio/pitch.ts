/**
 * Pitch detection (YIN) and frequency → note mapping.
 * Pure TypeScript, no React Native dependencies, so it can be unit-tested in Node.
 */

export const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'] as const;

export type Note = {
  /** e.g. "A" or "C♯" */
  name: (typeof NOTE_NAMES)[number];
  /** Scientific pitch octave, A4 = 440 Hz. */
  octave: number;
  /** MIDI note number of the nearest note. */
  midi: number;
  /** Detected frequency in Hz. */
  frequency: number;
  /** Exact frequency of the nearest note in Hz. */
  targetFrequency: number;
  /** Deviation from the nearest note, in cents (-50..50). */
  cents: number;
};

export function frequencyToNote(frequency: number, a4 = 440): Note {
  const exactMidi = 69 + 12 * Math.log2(frequency / a4);
  const midi = Math.round(exactMidi);
  const targetFrequency = a4 * Math.pow(2, (midi - 69) / 12);
  return {
    name: NOTE_NAMES[((midi % 12) + 12) % 12],
    octave: Math.floor(midi / 12) - 1,
    midi,
    frequency,
    targetFrequency,
    cents: 1200 * Math.log2(frequency / targetFrequency),
  };
}

export type PitchOptions = {
  minFrequency?: number;
  maxFrequency?: number;
  /** YIN absolute threshold; lower = stricter. */
  threshold?: number;
};

export type PitchResult = {
  frequency: number;
  /** 0..1, higher means a cleaner periodic signal. */
  clarity: number;
};

export function rms(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / samples.length);
}

/**
 * YIN fundamental-frequency estimator (de Cheveigné & Kawahara, 2002).
 * `samples` must contain at least 2 × (sampleRate / minFrequency) samples.
 * Returns null when no clear pitch is found.
 */
export function detectPitchYin(
  samples: Float32Array,
  sampleRate: number,
  { minFrequency = 50, maxFrequency = 2000, threshold = 0.12 }: PitchOptions = {}
): PitchResult | null {
  const tauMin = Math.max(2, Math.floor(sampleRate / maxFrequency));
  const tauMax = Math.min(Math.floor(samples.length / 2), Math.ceil(sampleRate / minFrequency));
  if (tauMax <= tauMin + 2) return null;

  const windowSize = samples.length - tauMax;
  const diff = new Float32Array(tauMax + 1);

  // Step 2: difference function.
  for (let tau = 1; tau <= tauMax; tau++) {
    let sum = 0;
    for (let i = 0; i < windowSize; i++) {
      const d = samples[i] - samples[i + tau];
      sum += d * d;
    }
    diff[tau] = sum;
  }

  // Step 3: cumulative mean normalized difference.
  const cmnd = new Float32Array(tauMax + 1);
  cmnd[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau <= tauMax; tau++) {
    runningSum += diff[tau];
    cmnd[tau] = runningSum === 0 ? 1 : (diff[tau] * tau) / runningSum;
  }

  // Step 4: absolute threshold — first dip below threshold, then walk to its local minimum.
  let tau = -1;
  for (let t = tauMin; t < tauMax; t++) {
    if (cmnd[t] < threshold) {
      while (t + 1 < tauMax && cmnd[t + 1] < cmnd[t]) t++;
      tau = t;
      break;
    }
  }
  if (tau === -1) return null;

  // Step 5: parabolic interpolation for sub-sample precision.
  let betterTau = tau;
  if (tau > 0 && tau < tauMax) {
    const s0 = cmnd[tau - 1];
    const s1 = cmnd[tau];
    const s2 = cmnd[tau + 1];
    const denom = 2 * (2 * s1 - s2 - s0);
    if (denom !== 0) betterTau = tau + (s2 - s0) / denom;
  }

  return { frequency: sampleRate / betterTau, clarity: 1 - cmnd[tau] };
}

/** Averages adjacent samples to cut the sample rate (and the YIN cost) by `factor`. */
export function decimate(samples: Float32Array, factor: number): Float32Array {
  if (factor <= 1) return samples;
  const out = new Float32Array(Math.floor(samples.length / factor));
  for (let i = 0; i < out.length; i++) {
    let sum = 0;
    for (let j = 0; j < factor; j++) sum += samples[i * factor + j];
    out[i] = sum / factor;
  }
  return out;
}
