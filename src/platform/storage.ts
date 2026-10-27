import type { Story } from '../engine/schema';
import type { GenerationRequest } from '../generation/contract';
export type SavedStory = {
  id: string;
  story: Story;
  recipe?: GenerationRequest;
  sourceToken?: string;
  savedAt: number;
};
export type Completion = {
  storyId: string;
  title: string;
  recap: string;
  completedAt: number;
};
const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Local storage is unavailable'));
      return;
    }
    const request = indexedDB.open('storymotion-library', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('stories', { keyPath: 'id' });
      request.result.createObjectStore('completions', { keyPath: 'storyId' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error('Please close other StoryMotion tabs and try again'));
  });
async function access<T>(
  store: 'stories' | 'completions',
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(store, mode);
    const request = run(transaction.objectStore(store));
    let result: T;
    request.onsuccess = () => {
      result = request.result;
    };
    transaction.oncomplete = () => {
      database.close();
      if (mode === 'readwrite')
        window.dispatchEvent(new Event('storymotion-library'));
      resolve(result);
    };
    transaction.onerror = transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? request.error);
    };
  });
}
export const savedStories = () =>
  access<SavedStory[]>('stories', 'readonly', (store) => store.getAll());
export const getSavedStory = (id: string) =>
  access<SavedStory | undefined>('stories', 'readonly', (store) =>
    store.get(id),
  );
export const saveStory = (
  story: Story,
  recipe?: GenerationRequest,
  sourceToken?: string,
) =>
  access('stories', 'readwrite', (store) =>
    store.put({
      id: story.id,
      story,
      recipe,
      sourceToken,
      savedAt: Date.now(),
    } satisfies SavedStory),
  );
export const removeStory = (id: string) =>
  access('stories', 'readwrite', (store) => store.delete(id));
export const completions = () =>
  access<Completion[]>('completions', 'readonly', (store) => store.getAll());
export const completeStory = (value: Omit<Completion, 'completedAt'>) =>
  access('completions', 'readwrite', (store) =>
    store.put({ ...value, completedAt: Date.now() }),
  );
