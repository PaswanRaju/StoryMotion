import { useI18n } from '../i18n';
import { Link } from 'react-router-dom';
import { ParentGate } from './ParentGate';
import { usePreferences } from './preferences';
export function ParentSettings() {
  const { t } = useI18n();
  const { settings: s, update } = usePreferences();
  return (
    <ParentGate label={t('parent')}>
      <div className="parent-settings">
        <label>
          {t('speed')}{' '}
          <input
            type="range"
            min="0.6"
            max="1.4"
            step="0.05"
            value={s.narrationRate}
            onChange={(e) => update({ narrationRate: Number(e.target.value) })}
          />
        </label>
        <label>
          {t('sensitivity')}{' '}
          <select
            value={s.sensitivity}
            onChange={(e) =>
              update({ sensitivity: e.target.value as typeof s.sensitivity })
            }
          >
            <option value="gentle">Gentle movements</option>
            <option value="standard">Standard</option>
            <option value="deliberate">Deliberate movements</option>
          </select>
        </label>
        {(
          [
            'seated',
            'captions',
            'reducedMotion',
            'camera',
            'classroom',
            'coop',
          ] as const
        ).map((key) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={s[key]}
              onChange={(e) => update({ [key]: e.target.checked })}
            />
            {t(
              (
                {
                  seated: 'seated',
                  captions: 'captions',
                  reducedMotion: 'reducedMotion',
                  camera: 'cameraAllowed',
                  classroom: 'classroom',
                  coop: 'coop',
                } as const
              )[key],
            )}
          </label>
        ))}
        <label>
          {t('volume')}{' '}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={s.volume}
            onChange={(e) => update({ volume: Number(e.target.value) })}
          />
        </label>
        <label>
          {t('language')}{' '}
          <select
            value={s.language}
            onChange={(e) =>
              update({ language: e.target.value as typeof s.language })
            }
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </label>
        <p>
          Only preferences and saved stories stay on this device. Camera data is
          never saved during play.
        </p>
        <Link
          onClick={() =>
            window.dispatchEvent(new Event('storymotion-parent-close'))
          }
          to="/parent/create"
        >
          Generate a story
        </Link>
        {' · '}
        <Link
          onClick={() =>
            window.dispatchEvent(new Event('storymotion-parent-close'))
          }
          to="/parent/editor"
        >
          Story creator
        </Link>
      </div>
    </ParentGate>
  );
}
