import { NarrationPanel, type NarrationPanelProps } from './NarrationPanel';

/**
 * Character speech, visually distinct from narrator captions (CLAUDE.md §6:
 * "speaker label" must be clear). Shares NarrationPanel's layout/behavior so
 * replay/continue/caption rules stay identical for both.
 */
export function DialoguePanel(props: NarrationPanelProps) {
  return (
    <NarrationPanel
      {...props}
      accent="radial-gradient(140% 90% at 50% 0%, #f4fbff 0%, #dcefff 70%, #c4e2f7 100%)"
    />
  );
}
