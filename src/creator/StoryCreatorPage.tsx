import { useMemo, useState } from 'react';
import { riveExample } from '../stories/riveExample';
import { ParentGate } from '../settings/ParentGate';
import { StoryPlayer } from '../components/player/StoryPlayer';
import { GestureSchema, StorySchema, validateStory } from '../engine/schema';
import type { Story, Scene, InteractionNode } from '../engine/schema';
import {
  assetRegistry,
  characterRegistry,
  registryCatalog,
} from '../engine/registry';
import { saveStory } from '../platform/storage';
import { Button, Panel } from '../ui';
function emptyScene(id: string, stage = 'plot'): Scene {
  return {
    id,
    title:
      stage === 'intro'
        ? 'Once upon a time'
        : stage === 'conclusion'
          ? 'The End'
          : 'A new discovery',
    durationMs: 12000,
    background: 'meadow',
    characters: [{ id: 'jack', animation: 'idle', x: 960, y: 850 }],
    narration: [
      {
        atMs: 0,
        text:
          stage === 'intro'
            ? 'Once upon a time, Jack set out to help his friends.'
            : stage === 'conclusion'
              ? 'Together they finished the job, and shared a happy day.'
              : 'Jack and his friends worked together, one step at a time.',
      },
    ],
    actions: [],
    soundEffects: [],
    transitions: { enterMs: 500, exitMs: 300 },
    interactions: [],
    events: [stage],
    next: { type: 'ending' },
  };
}
function blankStory(): Story {
  const scenes = ['intro', 'plot', 'climax', 'conclusion'].map((stage) =>
    emptyScene(`scene-${stage}`, stage),
  );
  scenes.forEach((scene, index) => {
    if (index < scenes.length - 1)
      scene.next = { type: 'scene', sceneId: scenes[index + 1].id };
  });
  return {
    id: `created-${Date.now()}`,
    title: 'Our new adventure',
    description: 'A story made together.',
    coverAsset: 'meadow',
    ageRange: [4, 8],
    startSceneId: scenes[0].id,
    scenes,
  };
}
export function StoryCreatorPage() {
  return (
    <Panel as="section" variant="scroll" className="grown-up-page">
      <h1>Story creator</h1>
      <p>Build and preview a story on this device.</p>
      <ParentGate label="Open story creator">
        <StoryEditor />
      </ParentGate>
    </Panel>
  );
}
export function StoryEditor() {
  const [story, setStory] = useState(blankStory);
  const [selected, setSelected] = useState(0);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState('');
  const error = useMemo(() => {
    try {
      validateStory(story, registryCatalog);
      return '';
    } catch (error) {
      return error instanceof Error ? error.message : 'Check your story.';
    }
  }, [story]);
  const scene = story.scenes[selected] ?? story.scenes[0];
  const edit = (change: (draft: Story) => void) =>
    setStory((prev) => {
      const draft = structuredClone(prev);
      change(draft);
      return draft;
    });
  const editScene = (change: (scene: Scene) => void) =>
    edit((draft) => change(draft.scenes[selected]));
  const editNode = (index: number, change: (node: InteractionNode) => void) =>
    editScene((scene) => change(scene.interactions[index]));
  const backgrounds = Object.entries(assetRegistry)
    .filter(([, asset]) => !asset.composition)
    .map(([id]) => id);
  const exportJSON = () => {
    const url = URL.createObjectURL(
      new Blob(
        [JSON.stringify(validateStory(story, registryCatalog), null, 2)],
        { type: 'application/json' },
      ),
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${story.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const addScene = () =>
    edit((draft) => {
      const added = emptyScene(`scene-${draft.scenes.length}-${Date.now()}`);
      const previous = draft.scenes.at(-1)!;
      if (previous.next.type === 'ending')
        previous.next = { type: 'scene', sceneId: added.id };
      draft.scenes.push(added);
    });
  return (
    <div className="story-editor">
      <div className="editor-actions">
        <Button
          variant="ghost"
          size="md"
          onClick={() => {
            setStory(structuredClone(riveExample));
            setSelected(0);
            setPreview(false);
          }}
        >
          Load Rive example
        </Button>
        <label>
          Import JSON
          <input
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (file.size > 1000000) {
                setMessage('Please use a story smaller than 1 MB.');
                return;
              }
              void file
                .text()
                .then((text) => {
                  const parsed = StorySchema.parse(JSON.parse(text));
                  setStory(parsed);
                  setSelected(0);
                  setPreview(false);
                  setMessage('Imported on this device.');
                })
                .catch(() =>
                  setMessage('That JSON does not match the story schema.'),
                );
            }}
          />
        </label>
        <Button
          variant="ghost"
          size="md"
          disabled={!!error}
          onClick={exportJSON}
        >
          Export JSON
        </Button>
        <Button
          variant="ghost"
          size="md"
          disabled={!!error}
          onClick={() =>
            void saveStory(story)
              .then(() => setMessage('Saved to My Stories.'))
              .catch(() => setMessage('This browser could not save the story.'))
          }
        >
          Save story
        </Button>
        <Button
          variant="ghost"
          size="md"
          disabled={!!error}
          onClick={() => setPreview((prev) => !prev)}
        >
          {preview ? 'Close preview' : 'Live preview'}
        </Button>
      </div>
      <p role="status">{message}</p>
      {error && (
        <p role="alert" className="validation-error">
          {error}
        </p>
      )}
      <label>
        Story title
        <input
          value={story.title}
          onChange={(e) =>
            edit((draft) => {
              draft.title = e.target.value;
            })
          }
        />
      </label>
      <div className="editor-layout">
        <nav aria-label="Scene list">
          <ol>
            {story.scenes.map((item, index) => (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  size="md"
                  aria-current={index === selected ? 'step' : undefined}
                  onClick={() => setSelected(index)}
                >
                  {item.title}
                </Button>
              </li>
            ))}
          </ol>
          <Button variant="ghost" size="md" onClick={addScene}>
            Add scene
          </Button>
        </nav>
        <div className="parent-settings">
          <label>
            Scene title
            <input
              value={scene.title}
              onChange={(e) =>
                editScene((scene) => {
                  scene.title = e.target.value;
                })
              }
            />
          </label>
          <label>
            Duration (seconds)
            <input
              type="number"
              min="1"
              max="120"
              value={scene.durationMs / 1000}
              onChange={(e) =>
                editScene((scene) => {
                  scene.durationMs = Number(e.target.value) * 1000;
                })
              }
            />
          </label>
          <label>
            Background
            <select
              value={scene.background}
              onChange={(e) =>
                editScene((scene) => {
                  scene.background = e.target.value;
                })
              }
            >
              {[...new Set([scene.background, ...backgrounds])].map((id) => (
                <option key={id}>{id}</option>
              ))}
            </select>
          </label>
          <label>
            Hero
            <select
              value={scene.characters[0]?.id ?? 'jack'}
              onChange={(e) =>
                editScene((scene) => {
                  scene.characters = [
                    { id: e.target.value, animation: 'idle', x: 960, y: 850 },
                  ];
                })
              }
            >
              {Object.keys(characterRegistry).map((id) => (
                <option key={id}>{id}</option>
              ))}
            </select>
          </label>
          {scene.narration.map((line, index) => (
            <label key={index}>
              Narration line {index + 1}
              <textarea
                rows={4}
                value={line.text}
                onChange={(e) =>
                  editScene((scene) => {
                    scene.narration[index].text = e.target.value;
                  })
                }
              />
            </label>
          ))}
          <label>
            Spanish narration
            <textarea
              rows={3}
              value={scene.narration[0].translations?.es?.text ?? ''}
              onChange={(e) =>
                editScene((scene) => {
                  const line = scene.narration[0];
                  if (!e.target.value) {
                    if (line.translations) delete line.translations.es;
                  } else
                    line.translations = {
                      ...line.translations,
                      es: { text: e.target.value },
                    };
                })
              }
            />
          </label>
          <label>
            Next scene
            <select
              value={scene.next.type === 'ending' ? '' : scene.next.sceneId}
              onChange={(e) =>
                editScene((scene) => {
                  scene.next = e.target.value
                    ? { type: 'scene', sceneId: e.target.value }
                    : { type: 'ending' };
                })
              }
            >
              <option value="">Ending</option>
              {story.scenes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          {scene.interactions.map((node, index) => (
            <fieldset key={node.id}>
              <legend>Interaction {index + 1}</legend>
              <label>
                Gesture
                <select
                  value={node.gesture}
                  onChange={(e) =>
                    editNode(index, (node) => {
                      node.gesture = GestureSchema.parse(e.target.value);
                    })
                  }
                >
                  {GestureSchema.options.map((gesture) => (
                    <option key={gesture}>{gesture}</option>
                  ))}
                </select>
              </label>
              <label>
                Prompt
                <input
                  value={node.prompt.body}
                  onChange={(e) =>
                    editNode(index, (node) => {
                      node.prompt.body = e.target.value;
                    })
                  }
                />
              </label>
              <label>
                Button label
                <input
                  value={node.buttonLabel}
                  onChange={(e) =>
                    editNode(index, (node) => {
                      node.buttonLabel = node.buttonText = e.target.value;
                    })
                  }
                />
              </label>
              <label>
                Start (seconds)
                <input
                  type="number"
                  min="0"
                  value={node.atMs / 1000}
                  onChange={(e) =>
                    editNode(index, (node) => {
                      node.atMs = Number(e.target.value) * 1000;
                    })
                  }
                />
              </label>
              <label>
                Window (seconds)
                <input
                  type="number"
                  min="1"
                  value={node.windowMs / 1000}
                  onChange={(e) =>
                    editNode(index, (node) => {
                      node.windowMs = Number(e.target.value) * 1000;
                    })
                  }
                />
              </label>
              <label>
                Player
                <select
                  value={node.player ?? ''}
                  onChange={(e) =>
                    editNode(index, (node) => {
                      node.player = e.target.value
                        ? (Number(e.target.value) as 1 | 2)
                        : undefined;
                    })
                  }
                >
                  <option value="">Either</option>
                  <option value="1">Player 1</option>
                  <option value="2">Player 2</option>
                </select>
              </label>
              {(['onSuccess', 'onTimeout'] as const).map((key) => (
                <label key={key}>
                  {key === 'onSuccess' ? 'Warm response' : 'If nobody moves'}
                  <input
                    value={node[key].spoken}
                    onChange={(e) =>
                      editNode(index, (node) => {
                        node[key].caption = node[key].spoken = e.target.value;
                      })
                    }
                  />
                </label>
              ))}
              {(['onSuccess', 'onTimeout'] as const).map((key) => (
                <div key={key}>
                  <label>
                    {key === 'onSuccess'
                      ? 'Scene after help'
                      : 'Scene after timeout'}
                    <select
                      value={node[key].nextSceneId ?? ''}
                      onChange={(e) =>
                        editNode(index, (node) => {
                          node[key].nextSceneId = e.target.value || null;
                        })
                      }
                    >
                      <option value="">Continue this scene</option>
                      {story.scenes.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  {scene.characters[0] && (
                    <label>
                      {key === 'onSuccess'
                        ? 'Success animation'
                        : 'Timeout animation'}
                      <select
                        value={
                          node[key].actions[0]?.animation ??
                          scene.characters[0].animation
                        }
                        onChange={(e) =>
                          editNode(index, (node) => {
                            node[key].actions = [
                              {
                                characterId: scene.characters[0].id,
                                animation: e.target.value,
                              },
                            ];
                          })
                        }
                      >
                        {characterRegistry[scene.characters[0].id]?.states.map(
                          (state) => (
                            <option key={state}>{state}</option>
                          ),
                        )}
                      </select>
                    </label>
                  )}
                </div>
              ))}
              <Button
                variant="ghost"
                size="md"
                onClick={() =>
                  editScene((scene) => {
                    scene.interactions.splice(index, 1);
                  })
                }
              >
                Remove interaction
              </Button>
            </fieldset>
          ))}
          <Button
            variant="ghost"
            size="md"
            onClick={() =>
              editScene((scene) => {
                scene.interactions.push({
                  id: `${scene.id}-moment-${Date.now()}`,
                  atMs: Math.max(0, scene.durationMs - 2500),
                  gesture: 'raiseHand',
                  windowMs: 8000,
                  prompt: {
                    title: 'Help our friend!',
                    body: 'Raise a hand, or tap the button.',
                  },
                  buttonLabel: 'Help',
                  buttonText: 'Help',
                  buttonHint: 'You can tap, too.',
                  onSuccess: {
                    actions: [],
                    nextSceneId: null,
                    caption: 'Thank you for helping!',
                    spoken: 'Thank you for helping!',
                  },
                  onTimeout: {
                    actions: [],
                    nextSceneId: null,
                    caption: 'Our friend found a way!',
                    spoken: 'Our friend found a way!',
                  },
                  alternatives: [],
                });
              })
            }
          >
            Add interaction
          </Button>
        </div>
      </div>
      {preview && !error && (
        <div className="editor-preview">
          <StoryPlayer
            key={JSON.stringify(story)}
            story={story}
            onComplete={() => setMessage('Preview finished.')}
          />
        </div>
      )}
    </div>
  );
}
