import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ParentGate } from '../settings/ParentGate';
import { usePreferences } from '../settings/preferences';
import { GenerationRequestSchema, HEROES, SETTINGS, LESSONS } from './contract';
import type { GenerationRequest } from './contract';
import { validateStory } from '../engine/schema';
import type { Story } from '../engine/schema';
import { registryCatalog } from '../engine/registry';
import { saveStory } from '../platform/storage';
import { StoryPlayer } from '../components/player/StoryPlayer';
export function StoryGeneratorPage() {
  return (
    <section>
      <h1>Grown-up story studio</h1>
      <p>Choose an adventure with no names or personal details.</p>
      <ParentGate label="Open story studio">
        <GeneratorForm />
      </ParentGate>
    </section>
  );
}
export function GeneratorForm({
  initial,
  sourceToken: originalToken,
}: {
  initial?: GenerationRequest;
  sourceToken?: string;
}) {
  const { settings } = usePreferences();
  const [recipe, setRecipe] = useState<GenerationRequest>(
    () =>
      initial ?? {
        hero: 'jack',
        setting: 'meadow',
        lesson: 'kindness',
        age: '4–5',
        length: 'short',
        quiz: false,
        seed: Math.floor(Math.random() * 1000000000),
        language: settings.language,
      },
  );
  const [story, setStory] = useState<Story | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [sourceToken, setSourceToken] = useState(originalToken);
  const [preview, setPreview] = useState(false);
  async function generate() {
    setBusy(true);
    setMessage('');
    setStory(null);
    try {
      const body = GenerationRequestSchema.parse(recipe);
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          ...(originalToken ? { sourceToken: originalToken } : {}),
        }),
        signal: AbortSignal.timeout(170000),
      });
      const result: unknown = await response.json();
      if (!response.ok)
        throw new Error(
          'Our story stars need a little rest. Please try again later.',
        );
      if (!result || typeof result !== 'object' || !('story' in result))
        throw new Error('Please try again.');
      setStory(validateStory(result.story, registryCatalog));
      setSourceToken(
        'sourceToken' in result && typeof result.sourceToken === 'string'
          ? result.sourceToken
          : undefined,
      );
    } catch {
      setMessage(
        'Our story stars need a little rest. Please try again later. The built-in stories are ready to play.',
      );
    } finally {
      setBusy(false);
    }
  }
  if (preview && story)
    return (
      <>
        <button className="btn" onClick={() => setPreview(false)}>
          Back to studio
        </button>
        <StoryPlayer story={story} onComplete={() => setPreview(false)} />
      </>
    );
  return (
    <div className="parent-settings">
      <p>
        Generation uses an online model and may incur API costs. Only these
        selections are sent. A grown-up should preview the story before sharing
        it.
      </p>
      {(
        [
          ['hero', HEROES],
          ['setting', SETTINGS],
          ['lesson', LESSONS],
          ['age', ['4–5', '6–7', '8–9']],
          ['length', ['short', 'medium']],
        ] as const
      ).map(([key, values]) => (
        <label key={key}>
          {key}
          <select
            disabled={busy || (!!originalToken && key !== 'age')}
            value={recipe[key]}
            onChange={(event) =>
              setRecipe((prev) => ({ ...prev, [key]: event.target.value }))
            }
          >
            {values.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      ))}
      <label>
        <input
          type="checkbox"
          disabled={busy || !!originalToken}
          checked={recipe.quiz}
          onChange={(event) =>
            setRecipe((prev) => ({ ...prev, quiz: event.target.checked }))
          }
        />{' '}
        Include a few questions
      </label>
      <button
        type="button"
        className="btn btn--primary"
        disabled={busy}
        onClick={() => void generate()}
      >
        {busy
          ? 'Making your story…'
          : initial
            ? 'Regenerate for this age'
            : 'Generate story'}
      </button>
      <p role="status">{message}</p>
      {story && (
        <>
          <h2>{story.title}</h2>
          <p>{story.description}</p>
          <button className="btn" onClick={() => setPreview(true)}>
            Preview story
          </button>
          <button
            className="btn"
            onClick={() =>
              void saveStory(story, recipe, sourceToken)
                .then(() => setMessage('Saved on this device.'))
                .catch(() =>
                  setMessage(
                    'This browser could not save the story. You can still preview it.',
                  ),
                )
            }
          >
            Save to My Stories
          </button>
          <Link to="/library">Open My Stories</Link>
        </>
      )}
    </div>
  );
}
