import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
    <section className="completion">
      <h1>🌟 {title}</h1>
      <h2>The End — Adventure Complete!</h2>
      <CompletionRecap storyId={id} />
      <Link className="btn" to="/library">
        Story library
      </Link>
      <Link className="btn" to={`/my-stories/${encodeURIComponent(id)}/play`}>
        Play again
      </Link>
    </section>
  );
}
