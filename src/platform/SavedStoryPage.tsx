import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getSavedStory } from './storage';
import type { SavedStory } from './storage';
import { StoryPlayer } from '../components/player/StoryPlayer';
import { validateStory } from '../engine/schema';
import { registryCatalog } from '../engine/registry';
import { ParentGate } from '../settings/ParentGate';
import { GeneratorForm } from '../generation/StoryGeneratorPage';
export function SavedStoryPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [saved, setSaved] = useState<SavedStory | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    void getSavedStory(id)
      .then((value) => {
        if (!value) throw new Error('This story is not on this device yet.');
        validateStory(value.story, registryCatalog);
        if (live) setSaved(value);
      })
      .catch(() => {
        if (live) setError('This story is not available on this device.');
      });
    return () => {
      live = false;
    };
  }, [id]);
  return saved ? (
    <>
      <StoryPlayer
        story={saved.story}
        onComplete={() =>
          void navigate(`/my-stories/${encodeURIComponent(id)}/complete`)
        }
      />
      {saved.recipe && (
        <ParentGate label="Change reading age">
          <GeneratorForm
            initial={saved.recipe}
            sourceToken={saved.sourceToken}
          />
        </ParentGate>
      )}
    </>
  ) : (
    <p role="status">
      {error || 'Opening your story…'} <Link to="/library">Story library</Link>
    </p>
  );
}
