import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioManager, AudioRecorder } from 'react-native-audio-api';

import { decimate, detectPitchYin, frequencyToNote, rms, type Note } from '@/audio/pitch';

export type DetectorStatus = 'idle' | 'starting' | 'listening' | 'denied' | 'error';

/** Samples analysed per frame (at the device rate). ~93 ms at 44.1 kHz — enough for E2 and lower. */
const ANALYSIS_SIZE = 4096;
/** Samples delivered per recorder callback — the analysis hop (~46 ms at 44.1 kHz). */
const BUFFER_LENGTH = 2048;
/** Below this RMS the input is treated as silence. */
const SILENCE_RMS = 0.01;
/** Pitches that YIN reports with less clarity than this are discarded. */
const MIN_CLARITY = 0.85;
/** Number of recent detections the displayed pitch is the median of. */
const SMOOTHING = 5;
/** How long the last note stays on screen after the sound stops. */
const HOLD_MS = 600;

const MIN_FREQUENCY = 50;
const MAX_FREQUENCY = 2000;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * Listens to the microphone through react-native-audio-api and reports the note being played.
 */
export function usePitchDetector() {
  const [status, setStatus] = useState<DetectorStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<Note | null>(null);
  const [level, setLevel] = useState(0);

  const recorderRef = useRef<AudioRecorder | null>(null);

  const stop = useCallback(async () => {
    const recorder = recorderRef.current;
    recorderRef.current = null;
    if (!recorder) return;
    recorder.clearOnAudioReady();
    recorder.clearOnError();
    if (recorder.isRecording()) await recorder.stop();
    await AudioManager.setAudioSessionActivity(false).catch(() => {});
    setStatus('idle');
    setLevel(0);
  }, []);

  const start = useCallback(async () => {
    if (recorderRef.current) return;
    setStatus('starting');
    setError(null);

    try {
      const permission = await AudioManager.requestRecordingPermissions();
      if (permission !== 'Granted') {
        setStatus('denied');
        return;
      }

      // `measurement` disables iOS voice processing (AGC, noise suppression) that would distort pitch.
      AudioManager.setSystemOptions({ ios: { category: 'record', mode: 'measurement' } });
      await AudioManager.setAudioSessionActivity(true);

      const recorder = new AudioRecorder();
      recorderRef.current = recorder;

      const frame = new Float32Array(ANALYSIS_SIZE);
      const recent: number[] = [];
      let lastHeard = 0;

      recorder.onError(({ message }) => {
        setError(message);
        setStatus('error');
      });

      const callbackResult = recorder.onAudioReady(
        { sampleRate: 44100, bufferLength: BUFFER_LENGTH, channelCount: 1 },
        ({ buffer }) => {
          // Slide the analysis window and append the newest samples.
          const chunk = buffer.getChannelData(0);
          if (chunk.length >= ANALYSIS_SIZE) {
            frame.set(chunk.subarray(chunk.length - ANALYSIS_SIZE));
          } else {
            frame.copyWithin(0, chunk.length);
            frame.set(chunk, ANALYSIS_SIZE - chunk.length);
          }

          const volume = rms(frame);
          setLevel(volume);

          const now = Date.now();
          let frequency: number | null = null;
          if (volume > SILENCE_RMS) {
            // Halve high sample rates: plenty for musical pitch and ~4× cheaper for YIN.
            const factor = buffer.sampleRate >= 32000 ? 2 : 1;
            const result = detectPitchYin(decimate(frame, factor), buffer.sampleRate / factor, {
              minFrequency: MIN_FREQUENCY,
              maxFrequency: MAX_FREQUENCY,
            });
            if (result && result.clarity >= MIN_CLARITY) frequency = result.frequency;
          }

          if (frequency !== null) {
            // A jump of more than ~a semitone means a new note: drop the old history.
            const last = recent[recent.length - 1];
            if (last && Math.abs(1200 * Math.log2(frequency / last)) > 100) recent.length = 0;
            recent.push(frequency);
            if (recent.length > SMOOTHING) recent.shift();
            lastHeard = now;
            setNote(frequencyToNote(median(recent)));
          } else if (now - lastHeard > HOLD_MS) {
            recent.length = 0;
            setNote(null);
          }
        }
      );
      if (callbackResult.status === 'error') throw new Error(callbackResult.message);

      const startResult = await recorder.start();
      if (startResult.status === 'error') throw new Error(startResult.message);

      setStatus('listening');
    } catch (e) {
      await stop();
      setError(e instanceof Error ? e.message : String(e));
      setStatus('error');
    }
  }, [stop]);

  useEffect(() => {
    return () => {
      void stop();
    };
  }, [stop]);

  return { status, error, note, level, start, stop };
}
