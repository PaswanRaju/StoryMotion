import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { completions, savedStories } from './storage';
import type { Completion, SavedStory } from './storage';
import { storyRegistry } from '../data/stories/registry';
import { useI18n } from '../i18n';
export function LibraryShelf({
  includeBuiltins = false,
}: {
  includeBuiltins?: boolean;
}) {
  const [saved, setSaved] = useState<SavedStory[]>([]);
  const [stickers, setStickers] = useState<Completion[]>([]);
  const { t } = useI18n();
  useEffect(() => {
    let live = true;
    const refresh = () => {
      void savedStories()
        .then((stories) => {
          if (live) setSaved(stories);
        })
        .catch(() => {});
      void completions()
        .then((records) => {
          if (live) setStickers(records);
        })
        .catch(() => {});
    };
    refresh();
    window.addEventListener('storymotion-library', refresh);
    return () => {
      live = false;
      window.removeEventListener('storymotion-library', refresh);
    };
  }, []);
  return (
    <section className="library-shelf" aria-label={t('myStories')}>
      <h2>{t('myStories')}</h2>
      <div className="shelf-grid">
        {includeBuiltins &&
          storyRegistry.map((story) => (
            <Link
              key={story.id}
              className="shelf-card"
              to={`/library/${story.id}/characters`}
            >
              {story.title}
              {stickers.some((record) => record.storyId === story.id) && (
                <span aria-label={t('completed')}> 🌟</span>
              )}
            </Link>
          ))}
        {saved.map(({ story }) => (
          <Link
            key={story.id}
            className="shelf-card"
            to={`/my-stories/${encodeURIComponent(story.id)}/play`}
          >
            {story.title}
            {stickers.some((record) => record.storyId === story.id) && (
              <span aria-label={t('completed')}> 🌟</span>
            )}
          </Link>
        ))}
      </div>
      {!saved.length && <p>{t('savedHint')}</p>}
      {stickers.length > 0 && (
        <div aria-label={t('stickers')}>
          {stickers.map((record) => (
            <p key={record.storyId}>
              🌟 {record.title} — {record.recap}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
