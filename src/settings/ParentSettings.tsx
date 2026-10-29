import { useI18n } from '../i18n';
import { Link } from 'react-router-dom';
import { ParentGate } from './ParentGate';
import { usePreferences } from './preferences';
import { Select, Slider, Toggle } from '../ui';

const TOGGLES = {
  seated: 'seated',
  captions: 'captions',
  reducedMotion: 'reducedMotion',
  camera: 'cameraAllowed',
  classroom: 'classroom',
  coop: 'coop',
} as const;

const closeParent = () =>
  window.dispatchEvent(new Event('storymotion-parent-close'));

export function ParentSettings() {
  const { t } = useI18n();
  const { settings: s, update } = usePreferences();
  return (
    <ParentGate label={t('parent')}>
      <div className="parent-settings">
        <Slider
          label={t('speed')}
          min={0.6}
          max={1.4}
          step={0.05}
          value={s.narrationRate}
          format={(value) => `${value.toFixed(2)}×`}
          onChange={(value) => update({ narrationRate: value })}
        />
        <Select
          label={t('sensitivity')}
          value={s.sensitivity}
          onChange={(value) =>
            update({ sensitivity: value as typeof s.sensitivity })
          }
          options={[
            { value: 'gentle', label: 'Gentle movements' },
            { value: 'standard', label: 'Standard' },
            { value: 'deliberate', label: 'Deliberate movements' },
          ]}
        />
        {(Object.keys(TOGGLES) as Array<keyof typeof TOGGLES>).map((key) => (
          <Toggle
            key={key}
            label={t(TOGGLES[key])}
            checked={s[key]}
            onChange={(checked) => update({ [key]: checked })}
          />
        ))}
        <Slider
          label={t('volume')}
          min={0}
          max={1}
          step={0.05}
          value={s.volume}
          format={(value) => `${Math.round(value * 100)}%`}
          onChange={(value) => update({ volume: value })}
        />
        <Select
          label={t('language')}
          value={s.language}
          onChange={(value) => update({ language: value as typeof s.language })}
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
          ]}
        />
        <p>
          Only preferences and saved stories stay on this device. Camera data is
          never saved during play.
        </p>
        <p className="parent-settings__links">
          <Link onClick={closeParent} to="/parent/create">
            Generate a story
          </Link>
          {' · '}
          <Link onClick={closeParent} to="/parent/editor">
            Story creator
          </Link>
        </p>
      </div>
    </ParentGate>
  );
}
