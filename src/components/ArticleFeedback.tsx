import { useState } from 'react';

interface Props {
  uid?: string; // absent on malformed/legacy data; renders nothing rather than a dead control
  title: string; // folded into each button's aria-label so screen readers get per-article context
}

// Best-effort POST to the demo feedback sink (vite-plugin-feedback.ts). Only
// answers in `npm run dev` / `npm run preview` — production is a static
// site with no server, so this silently no-ops there. Fire-and-forget: a
// failed post shouldn't disrupt the toggle itself.
function postFeedback(uid: string, title: string, vote: 'up' | 'down' | null) {
  void fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, title, vote }),
  }).catch(() => {});
}

// Helpful/not-helpful toggle for one article. Vote is kept in component state
// (lost on reload/day switch) and best-effort logged via postFeedback above.
export default function ArticleFeedback({ uid, title }: Props) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  if (!uid) return null;

  // Computed from the already-read `vote` state rather than a setState
  // updater callback, which must stay pure — React.StrictMode double-invokes
  // updaters in dev specifically to catch side effects like postFeedback
  // living there (it did; that's what caused the double-logged clicks).
  const toggle = (v: 'up' | 'down') => {
    const next = vote === v ? null : v;
    setVote(next);
    postFeedback(uid, title, next);
  };

  return (
    <div className="oneb-feedback" role="group" aria-label={`Was "${title}" helpful?`}>
      <button
        type="button"
        className="oneb-feedback-btn"
        aria-pressed={vote === 'up'}
        aria-label={`Mark "${title}" as helpful`}
        onClick={() => toggle('up')}
      >
        <span aria-hidden="true">👍</span>
      </button>
      <button
        type="button"
        className="oneb-feedback-btn"
        aria-pressed={vote === 'down'}
        aria-label={`Mark "${title}" as not helpful`}
        onClick={() => toggle('down')}
      >
        <span aria-hidden="true">👎</span>
      </button>
    </div>
  );
}
