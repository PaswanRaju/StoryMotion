import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ButtonLink, Panel } from '../ui';
import { completions, getSavedStory } from './storage';
export function CompletionRecap({ storyId }: { storyId: string }) {
  const [recap, setRecap] = useState('');
  useEffect(() => {
    let live = true;
    const refresh = () =>
      void completions()
        .then((records) => {
          if (live)
            setRecap(
              records.find((record) => record.storyId === storyId)?.recap ?? '',
            );
        })
        .catch(() => {});
    refresh();
    window.addEventListener('storymotion-library', refresh);
    return () => {
      live = false;
      window.removeEventListener('storymotion-library', refresh);
    };
  }, [storyId]);
  return recap ? (
    <p className="completion-recap" role="status">
      🌟 {recap}
    </p>
  ) : null;
}
export function SavedCompletionPage() {
  const { id = '' } = useParams();
  const [title, setTitle] = useState('Your adventure');
  useEffect(() => {
    let live = true;
    void getSavedStory(id)
      .then((saved) => {
        if (live && saved) setTitle(saved.story.title);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [id]);
  return (
    <Panel
      as="section"
      variant="glow"
      entrance
      className="completion saved-completion"
    >
      <h1>🌟 {title}</h1>
      <h2>The End — Adventure Complete!</h2>
      <CompletionRecap storyId={id} />
      <div className="ui-row ui-row--center">
        <ButtonLink variant="secondary" to="/library">
          Story library
        </ButtonLink>
        <ButtonLink to={`/my-stories/${encodeURIComponent(id)}/play`}>
          Play again
        </ButtonLink>
      </div>
    </Panel>
  );
}
