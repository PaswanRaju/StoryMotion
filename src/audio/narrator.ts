/**
 * The one place that talks to speechSynthesis. Lines are identified by a stable id, so
 * asking for the line that is already playing (a React re-render, StrictMode's
 * mount → unmount → mount, a gesture) is a no-op. Only a new id or an explicit
 * replay() starts speech from the beginning. Pause/mute interrupt the line and
 * remember the last spoken word; resume/unmute continue from that word.
 *
 * Speech is best effort: captions and story time never wait for it.
 */
export type SpeechLike = Pick<SpeechSynthesis, 'speak' | 'cancel'>;
type UtteranceFactory = (text: string) => SpeechSynthesisUtterance;

type Status = 'idle' | 'speaking' | 'interrupted' | 'done';

/**
 * Some voices (Chrome's Google network voices) never fire boundary events. Then the
 * interrupted word is estimated from speaking time — slightly slow on purpose, so a
 * resume may repeat a word but does not skip one.
 */
const ESTIMATED_CHARS_PER_SECOND = 12;

export function createNarrator(
  getSynth: () => SpeechLike | null,
  makeUtterance: UtteranceFactory,
) {
  let line: { id: string; text: string } | null = null;
  let status: Status = 'idle';
  /** Character index of the word being spoken; resume restarts from that word. */
  let offset = 0;
  let enabled = true;
  let rate = 0.88;
  let volume = 0.8;
  let language = 'en-US';
  let paused = false;
  /** Ignores late end/boundary events from utterances that were cancelled. */
  let generation = 0;
  /** Held so Chrome cannot garbage-collect a speaking utterance mid-line. */
  let current: SpeechSynthesisUtterance | null = null;
  let releaseTimer: ReturnType<typeof setTimeout> | null = null;
  let startedAt = 0;
  let heardBoundary = false;
  /** Reaction lines already said (by id), and whether one is playing now. */
  const interjected = new Set<string>();
  let interjecting = false;

  const canSpeak = () => enabled && !paused;

  function silence() {
    generation++;
    current = null;
    interjecting = false;
    try {
      getSynth()?.cancel();
    } catch {
      /* Captions remain available. */
    }
  }

  function speakFrom(from: number) {
    const synth = getSynth();
    if (!line || !synth) return;
    silence();
    const text = line.text.slice(from);
    if (!text.trim()) {
      status = 'done';
      return;
    }
    const mine = generation;
    const utterance = makeUtterance(text);
    utterance.rate = rate;
    utterance.volume = volume;
    utterance.lang = language;
    utterance.onboundary = (event) => {
      if (mine !== generation) return;
      heardBoundary = true;
      offset = from + event.charIndex;
    };
    utterance.onend = () => {
      if (mine === generation && status === 'speaking') status = 'done';
    };
    utterance.onerror = () => {
      // Autoplay refusal or a missing voice: give up on this line, keep captions.
      if (mine === generation && status === 'speaking') status = 'done';
    };
    current = utterance;
    offset = from;
    startedAt = Date.now();
    heardBoundary = false;
    status = 'speaking';
    try {
      synth.speak(utterance);
    } catch {
      status = 'done';
    }
  }

  function interrupt() {
    if (status !== 'speaking' || !line) return;
    if (!heardBoundary) {
      const spoken = Math.floor(
        (((Date.now() - startedAt) / 1000) *
          ESTIMATED_CHARS_PER_SECOND *
          rate) /
          0.88,
      );
      const reached = offset + spoken;
      // Back up to the start of the word that was being spoken.
      offset =
        reached >= line.text.length
          ? line.text.length
          : line.text.lastIndexOf(' ', reached) + 1;
    }
    status = offset >= line.text.trimEnd().length ? 'done' : 'interrupted';
    silence();
  }

  function stop() {
    silence();
    interjected.clear();
    line = null;
    status = 'idle';
    offset = 0;
  }

  function sync() {
    if (!canSpeak()) {
      if (interjecting) silence(); // a reaction is not resumed later
      interrupt();
    } else if (status === 'interrupted') speakFrom(offset);
  }

  return {
    /** Speak this line once. Repeating the current id never restarts it. */
    setLine(id: string, text: string) {
      if (line?.id === id && line.text === text) return;
      line = { id, text };
      offset = 0;
      if (canSpeak()) speakFrom(0);
      else {
        // Spoken from the start once sound/playback is allowed, if still current.
        silence();
        status = 'interrupted';
      }
    },
    setLanguage(value: string) {
      language = value === 'es' ? 'es-ES' : 'en-US';
    },
    setRate(value: number) {
      if (rate === value) return;
      const wasSpeaking = status === 'speaking';
      if (wasSpeaking) interrupt();
      rate = value;
      if (wasSpeaking && canSpeak()) speakFrom(offset);
    },
    setVolume(value: number) {
      volume = value;
      if (current) current.volume = value;
    },
    setEnabled(value: boolean) {
      enabled = value;
      sync();
    },
    setPaused(value: boolean) {
      paused = value;
      sync();
    },
    /**
     * A one-shot reaction ("Wow! A magic shield!"). Said at most once per id, only
     * while sound is allowed, and immediately: it ends the current story line, which
     * is then considered finished (never replayed or resumed afterwards).
     */
    interject(id: string, text: string) {
      if (interjected.has(id)) return;
      interjected.add(id);
      const synth = getSynth();
      if (!synth || !canSpeak()) return;
      if (status === 'speaking' || status === 'interrupted') status = 'done';
      silence();
      const mine = generation;
      const utterance = makeUtterance(text);
      utterance.rate = rate * (0.95 / 0.88);
      utterance.volume = volume;
      utterance.lang = language;
      utterance.onend = utterance.onerror = () => {
        if (mine === generation) interjecting = false;
      };
      current = utterance;
      interjecting = true;
      try {
        synth.speak(utterance);
      } catch {
        interjecting = false;
      }
    },
    /** Queue an invitation after the current line so the plot is never cut off. */
    instruct(id: string, text: string) {
      if (interjected.has(id)) return;
      interjected.add(id);
      const synth = getSynth();
      if (!synth || !canSpeak()) return;
      const utterance = makeUtterance(text);
      utterance.rate = rate;
      utterance.volume = volume;
      utterance.lang = language;
      try {
        synth.speak(utterance);
      } catch {
        /* Visual prompts remain. */
      }
    },
    /** Intentional replay: the current line from its first word. */
    replay() {
      if (!line) return;
      offset = 0;
      if (canSpeak()) speakFrom(0);
      else {
        silence();
        status = 'interrupted';
      }
    },
    /** A player mounted; keep speaking (undoes a pending release). */
    claim() {
      if (releaseTimer !== null) clearTimeout(releaseTimer);
      releaseTimer = null;
    },
    /**
     * A player unmounted. Stop shortly after, unless it is mounted again first —
     * StrictMode remounts synchronously, so speech is not cut off and restarted.
     */
    release() {
      if (releaseTimer !== null) clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => {
        releaseTimer = null;
        stop();
      }, 0);
    },
    stop,
    /** For tests and debugging. */
    get state() {
      return {
        lineId: line?.id ?? null,
        status,
        offset,
        holding: current,
        charIndex:
          status === 'speaking' && !heardBoundary
            ? Math.min(
                line?.text.length ?? 0,
                offset +
                  Math.floor(
                    (((Date.now() - startedAt) / 1000) *
                      ESTIMATED_CHARS_PER_SECOND *
                      rate) /
                      0.88,
                  ),
              )
            : offset,
      };
    },
  };
}
export type Narrator = ReturnType<typeof createNarrator>;

const supported = () =>
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  'SpeechSynthesisUtterance' in window;

export const narrator = createNarrator(
  () => (supported() ? window.speechSynthesis : null),
  (text) => new SpeechSynthesisUtterance(text),
);
