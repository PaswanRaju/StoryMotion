import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStoryById } from '../../data/stories/registry';
import { demoChallengeByStory, demoChoiceByStory } from '../../data/stories/demoBeats';
import { StoryNotFound } from '../library/StoryNotFound';
import { useSession } from '../../app/SessionContext';
import { routes } from '../../app/router';
import { PlayerToolbar } from './PlayerToolbar';
import { NarrationPanel } from './NarrationPanel';
import { DialoguePanel } from './DialoguePanel';
import { ChoicePanel } from './ChoicePanel';
import { ChallengePanel } from './ChallengePanel';
import { PauseDialog } from './PauseDialog';

type Step = 'narration' | 'choice' | 'reaction' | 'challenge';

export function StoryPlayerPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { characterId, audioEnabled, toggleAudio } = useSession();

  const story = storyId ? getStoryById(storyId) : undefined;

  const [step, setStep] = useState<Step>('narration');
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const [reps, setReps] = useState(0);
  const [paused, setPaused] = useState(false);

  if (!story) {
    return <StoryNotFound />;
  }

  const character =
    story.characters.find((candidate) => candidate.id === characterId) ??
    story.characters[0];
  const challenge = demoChallengeByStory[story.id];
  const choiceContent = demoChoiceByStory[story.id];
  const completed = reps >= challenge.target;

  function restartStory() {
    setStep('narration');
    setChoiceId(null);
    setReps(0);
    setPaused(false);
  }

  function restartChapter() {
    // Demo has a single chapter; "restart chapter" rewinds progress within
    // the current step rather than the whole story.
    if (step === 'challenge') setReps(0);
    if (step === 'choice' || step === 'reaction') setChoiceId(null);
    setPaused(false);
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <PlayerToolbar
        title={story.title}
        chapterLabel={`Playing as ${character.name}`}
        muted={!audioEnabled}
        onToggleMute={toggleAudio}
        onPause={() => setPaused(true)}
        onRestart={restartStory}
      />

      <div
        aria-hidden="true"
        style={{
          aspectRatio: '16 / 9',
          borderRadius: 'var(--radius-lg)',
          background: story.coverBackground,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
        }}
      >
        🎬
      </div>

      {step === 'narration' && (
        <NarrationPanel
          speaker="Narrator"
          text={story.teaser}
          onReplay={() => {}}
          onContinue={!paused ? () => setStep('choice') : undefined}
        />
      )}

      {step === 'choice' && (
        <ChoicePanel
          prompt={choiceContent.prompt}
          choices={choiceContent.choices}
          selectedId={choiceId}
          onChoose={(id) => {
            if (paused) return;
            setChoiceId(id);
            setStep('reaction');
          }}
        />
      )}

      {step === 'reaction' && choiceId && (
        <DialoguePanel
          speaker={character.name}
          text={choiceContent.reactions[choiceId]}
          onReplay={() => {}}
          onContinue={!paused ? () => setStep('challenge') : undefined}
        />
      )}

      {step === 'challenge' && (
        <ChallengePanel
          instruction={challenge.instruction}
          movement={challenge.movement}
          progress={reps}
          target={challenge.target}
          completed={completed}
          onRecordRep={() => !paused && setReps((n) => Math.min(n + 1, challenge.target))}
          onContinue={() => navigate(routes.complete(story.id))}
        />
      )}

      {paused && (
        <PauseDialog
          onResume={() => setPaused(false)}
          onReplayInstruction={() => setPaused(false)}
          onRestartChapter={restartChapter}
          onRestartStory={restartStory}
          onExitToLibrary={() => navigate(routes.library())}
        />
      )}
    </section>
  );
}
