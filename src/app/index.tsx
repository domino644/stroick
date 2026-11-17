import { useEffect } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { usePitchDetector } from '@/hooks/use-pitch-detector';
import { useTheme } from '@/hooks/use-theme';

/** Within this many cents the note counts as in tune. */
const IN_TUNE_CENTS = 5;
const GREEN = '#2EAD5B';
const ORANGE = '#E8890C';

export default function TunerScreen() {
  const theme = useTheme();
  const { status, error, note, level, start, stop } = usePitchDetector();

  useEffect(() => {
    void start();
  }, [start]);

  const inTune = note !== null && Math.abs(note.cents) <= IN_TUNE_CENTS;
  const accent = note === null ? theme.textSecondary : inTune ? GREEN : ORANGE;
  // Needle position: -50..50 cents → 0..100 %.
  const needle = note === null ? 50 : 50 + Math.max(-50, Math.min(50, note.cents));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="code" style={styles.appName}>
          stroick
        </ThemedText>

        <View style={styles.noteArea}>
          <View style={styles.noteRow}>
            <ThemedText style={[styles.noteName, { color: accent }]}>{note?.name ?? '–'}</ThemedText>
            {note && (
              <ThemedText style={[styles.octave, { color: accent }]}>{note.octave}</ThemedText>
            )}
          </View>

          <ThemedText type="default" themeColor="textSecondary">
            {note
              ? `${note.frequency.toFixed(1)} Hz · target ${note.targetFrequency.toFixed(1)} Hz`
              : statusMessage(status)}
          </ThemedText>
        </View>

        <View style={styles.meter}>
          <View style={[styles.scale, { backgroundColor: theme.backgroundElement }]}>
            <View style={[styles.centerMark, { backgroundColor: theme.textSecondary }]} />
            <View
              style={[
                styles.needle,
                { left: `${needle}%`, backgroundColor: accent, opacity: note ? 1 : 0.3 },
              ]}
            />
          </View>
          <View style={styles.scaleLabels}>
            <ThemedText type="small" themeColor="textSecondary">
              ♭ −50
            </ThemedText>
            <ThemedText type="smallBold" style={{ color: accent }}>
              {note ? `${note.cents >= 0 ? '+' : '−'}${Math.abs(note.cents).toFixed(0)} cents` : ' '}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              +50 ♯
            </ThemedText>
          </View>
        </View>

        <View style={[styles.levelTrack, { backgroundColor: theme.backgroundElement }]}>
          <View
            style={[
              styles.levelFill,
              { width: `${Math.min(100, level * 400)}%`, backgroundColor: theme.textSecondary },
            ]}
          />
        </View>

        {error && (
          <ThemedText type="small" style={styles.error}>
            {error}
          </ThemedText>
        )}

        <Pressable
          onPress={() => {
            if (status === 'denied') void Linking.openSettings();
            else if (status === 'listening') void stop();
            else void start();
          }}
          disabled={status === 'starting'}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.6 : 1 },
          ]}>
          <ThemedText type="smallBold">{buttonLabel(status)}</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

function statusMessage(status: ReturnType<typeof usePitchDetector>['status']) {
  switch (status) {
    case 'listening':
      return 'Play a note…';
    case 'starting':
      return 'Starting microphone…';
    case 'denied':
      return 'Microphone access is needed to hear your notes.';
    case 'error':
      return 'Could not start the microphone.';
    default:
      return 'Paused';
  }
}

function buttonLabel(status: ReturnType<typeof usePitchDetector>['status']) {
  switch (status) {
    case 'listening':
      return 'Stop';
    case 'denied':
      return 'Open settings';
    case 'starting':
      return 'Starting…';
    default:
      return 'Start listening';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.five,
    alignItems: 'center',
  },
  appName: {
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  noteArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  noteName: {
    fontSize: 140,
    lineHeight: 150,
    fontWeight: 700,
    fontVariant: ['tabular-nums'],
  },
  octave: {
    fontSize: 40,
    lineHeight: 70,
    fontWeight: 600,
  },
  meter: {
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  scale: {
    height: 48,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  centerMark: {
    position: 'absolute',
    left: '50%',
    top: 8,
    bottom: 8,
    width: 2,
    marginLeft: -1,
    opacity: 0.5,
  },
  needle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 6,
    marginLeft: -3,
    borderRadius: 3,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelTrack: {
    alignSelf: 'stretch',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
  },
  error: {
    color: '#D93F3F',
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
});
