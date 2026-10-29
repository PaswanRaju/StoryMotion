import { useState, type ReactNode } from 'react';
import {
  Heart,
  Pause,
  Play,
  Settings,
  Sparkles,
  Star,
  Volume2,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  Dialog,
  IconButton,
  Medal,
  Panel,
  ProgressBar,
  ProgressRing,
  Select,
  SelectCard,
  Slider,
  Toggle,
  useToast,
  type ButtonVariant,
} from '..';
import { palette } from '../tokens';
import { StoryCover } from '../../components/art/StoryArt';
import './gallery.css';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'magic', 'ghost'];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="gallery__section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

/**
 * Dev-only catalogue of every src/ui component in every state
 * (route: /dev/ui-gallery, registered only when import.meta.env.DEV).
 */
export function UiGalleryPage() {
  const toast = useToast();
  const [dialog, setDialog] = useState<'glass' | 'scroll' | null>(null);
  const [selected, setSelected] = useState('hare');
  const [on, setOn] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(3);
  const [lang, setLang] = useState('en');

  return (
    <div className="gallery">
      <header>
        <p className="eyebrow">Developer only</p>
        <h1>StoryMotion UI gallery</h1>
        <p>
          Every component in every state. Toggle reduced motion in your OS or in
          the grown-up settings to check the calm versions. See
          docs/ART_DIRECTION.md.
        </p>
      </header>

      <Section title="Candy buttons">
        {VARIANTS.map((variant) => (
          <div className="ui-row gallery__row" key={variant}>
            <code>{variant}</code>
            <Button variant={variant} size="sm">
              Small (grown-up)
            </Button>
            <Button variant={variant} size="md">
              Medium (grown-up)
            </Button>
            <Button
              variant={variant}
              icon={<Play size={24} fill="currentColor" />}
            >
              Large (child)
            </Button>
            <Button variant={variant} size="xl" icon={<Sparkles size={28} />}>
              Hero
            </Button>
            <Button variant={variant} disabled>
              Disabled
            </Button>
          </div>
        ))}
        <p className="gallery__note">
          Hover: lifts + glows. Press: squashes onto its edge. Release: springs
          back with a sparkle burst and a click sound. Tab: gold-blue focus
          ring.
        </p>
      </Section>

      <Section title="Icon and round buttons">
        <div className="ui-row">
          <IconButton
            icon={<Pause size={26} fill="currentColor" />}
            label="Pause"
          />
          <IconButton
            variant="secondary"
            icon={<Volume2 size={26} />}
            label="Sound"
          />
          <IconButton
            variant="primary"
            icon={<Star size={26} fill="currentColor" />}
            label="Star"
          />
          <IconButton
            variant="magic"
            shape="squircle"
            icon={<Heart size={26} fill="currentColor" />}
            label="Love"
          />
          <IconButton
            size="xl"
            variant="primary"
            icon={<Play size={40} fill="currentColor" />}
            label="Play"
            showLabel
          />
          <IconButton
            size="md"
            icon={<Settings size={22} />}
            label="Settings (grown-up size)"
          />
          <IconButton icon={<Pause size={26} />} label="Disabled" disabled />
        </div>
      </Section>

      <Section title="Panels and dialogs">
        <div className="gallery__grid">
          <Panel variant="glass">
            <h3>Glass</h3>
            <p>Frosted night-sky glass for app chrome.</p>
          </Panel>
          <Panel variant="glow">
            <h3>Glow</h3>
            <p>The one thing to look at right now.</p>
          </Panel>
          <Panel variant="scroll">
            <h3>Scroll</h3>
            <p>Warm parchment for story text and grown-up reading.</p>
          </Panel>
        </div>
        <div className="ui-row">
          <Button variant="secondary" onClick={() => setDialog('glass')}>
            Open glass dialog
          </Button>
          <Button variant="secondary" onClick={() => setDialog('scroll')}>
            Open scroll dialog
          </Button>
        </div>
        {dialog && (
          <Dialog
            title={dialog === 'glass' ? 'Paused' : 'Grown-up settings'}
            variant={dialog}
            onClose={() => setDialog(null)}
          >
            <div className="ui-stack">
              <p>
                Bounces in; fades only with reduced motion. Escape closes, Tab
                stays inside.
              </p>
              <Button block onClick={() => setDialog(null)}>
                Resume
              </Button>
            </div>
          </Dialog>
        )}
      </Section>

      <Section title="Story cards and select cards">
        <div className="gallery__grid">
          {(['hare', 'beanstalk', 'pigs'] as const).map((id) => (
            <Card key={id} tone={id} art={<StoryCover storyId={id} />}>
              <h3>
                {id === 'hare'
                  ? 'The Tortoise and the Hare'
                  : id === 'beanstalk'
                    ? 'Jack and the Beanstalk'
                    : 'The Three Little Pigs'}
              </h3>
              <div className="ui-row">
                <Badge tone="gold">Featured</Badge>
                <Badge>3 magic moments</Badge>
              </div>
              <Button block icon={<Play size={24} fill="currentColor" />}>
                Play Now
              </Button>
            </Card>
          ))}
        </div>
        <div className="gallery__grid">
          {(['hare', 'beanstalk', 'pigs'] as const).map((id) => (
            <SelectCard
              key={id}
              tone={id}
              selected={selected === id}
              onClick={() => setSelected(id)}
            >
              <strong>{selected === id ? 'Selected!' : 'Pick me'}</strong>
              <span>Select card · {id}</span>
            </SelectCard>
          ))}
          <SelectCard selected={false} disabled>
            <strong>Disabled</strong>
          </SelectCard>
        </div>
      </Section>

      <Section title="Toggles, sliders, selects">
        <div className="gallery__grid">
          <Panel variant="glass" className="ui-stack">
            <Toggle
              label="Captions"
              checked={on}
              onChange={setOn}
              description="Shown under every scene."
            />
            <Toggle label="Off state" checked={false} onChange={() => {}} />
            <Toggle label="Disabled" checked onChange={() => {}} disabled />
          </Panel>
          <Panel variant="scroll" className="ui-stack">
            <Slider
              label="Volume"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={setVolume}
              format={(v) => `${Math.round(v * 100)}%`}
            />
            <Slider
              label="Disabled"
              min={0}
              max={10}
              value={4}
              onChange={() => {}}
              disabled
            />
            <Select
              label="Language"
              value={lang}
              onChange={setLang}
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español' },
              ]}
            />
          </Panel>
        </div>
      </Section>

      <Section title="Progress">
        <div className="ui-row gallery__row">
          <div style={{ flex: 1, minWidth: 240 }}>
            <ProgressBar value={progress} max={5} label="Challenge progress" />
          </div>
          <ProgressRing value={progress} max={5} label="Ring progress">
            {progress}
          </ProgressRing>
          <ProgressRing value={5} max={5} label="Complete" size={96}>
            ★
          </ProgressRing>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setProgress((p) => (p + 1) % 6)}
          >
            Step progress
          </Button>
        </div>
      </Section>

      <Section title="Badges, medals, toasts">
        <div className="ui-row gallery__row">
          <Badge tone="gold" icon="⭐">
            Gold
          </Badge>
          <Badge tone="cyan">Cyan</Badge>
          <Badge tone="violet">Violet</Badge>
          <Badge tone="leaf" icon="🌱">
            Leaf
          </Badge>
          <Badge>Glass</Badge>
          <Medal />
          <Medal symbol="🐢" size={96} />
        </div>
        <div className="ui-row">
          <Button
            variant="ghost"
            size="md"
            onClick={() => toast.show('Settings saved on this device.')}
          >
            Info toast
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() =>
              toast.show('Great move!', { icon: '✨', tone: 'success' })
            }
          >
            Success toast
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() =>
              toast.show('New sticker added!', { icon: '🌟', tone: 'magic' })
            }
          >
            Magic toast
          </Button>
        </div>
      </Section>

      <Section title="Palettes">
        {Object.entries(palette).map(([world, colors]) => (
          <div className="ui-row gallery__row" key={world}>
            <code>{world}</code>
            {Object.entries(colors).map(([name, value]) => (
              <span
                key={name}
                className="gallery__swatch"
                style={{ background: value }}
                title={`${name} ${value}`}
              >
                <span>{name}</span>
              </span>
            ))}
          </div>
        ))}
      </Section>

      <Section title="Typography">
        <p className="gallery__display">Fredoka display — Once upon a time…</p>
        <p className="gallery__caption">
          Nunito caption — The tortoise kept going, one slow step at a time.
        </p>
      </Section>
    </div>
  );
}
