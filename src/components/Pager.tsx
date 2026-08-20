import { accessibleName } from '../utils/format';

interface Props {
  label: string; // section name, lower case — "conversation starters"
  page: number; // 1-based
  pageCount: number;
  pageSize: number;
  total: number; // candidates in the whole set, not just this page
  prevText?: string; // visible button text (per-style microcopy)
  nextText?: string;
  onPrev: () => void;
  onNext: () => void;
}

// Bidirectional controls for one section's candidate set. Presentational: the
// position lives in usePaging, so all three sections share one set of controls
// without a wrapper component fighting their different markup.
export default function Pager({ label, page, pageCount, pageSize, total, prevText = 'Previous', nextText = 'Next', onPrev, onNext }: Props) {
  // A set that fits needs no controls at all.
  if (pageCount <= 1) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const range = first === last ? `${first}` : `${first}–${last}`;
  // aria-disabled rather than `disabled`: the end state flips on the same click
  // that reaches it, and a control that disables itself under the user's focus
  // drops that focus to <body>. Announced as unavailable, still tabbable.
  const atStart = page === 1;
  // The heading is per-style microcopy and may carry decorative emoji.
  const name = accessibleName(label);
  const atEnd = page === pageCount;

  return (
    <div className="oneb-pager">
      <button
        type="button"
        className="oneb-pager-btn"
        aria-label={`Previous ${name}`}
        aria-disabled={atStart}
        onClick={atStart ? undefined : onPrev}
      >
        {prevText}
      </button>
      {/* Polite so the new position is announced without pulling focus off the
          control the reader just used. Scoped to this section's own pager. */}
      <span className="oneb-pager-status" role="status" aria-live="polite">
        {range} of {total}
      </span>
      <button
        type="button"
        className="oneb-pager-btn"
        aria-label={`Next ${name}`}
        aria-disabled={atEnd}
        onClick={atEnd ? undefined : onNext}
      >
        {nextText}
      </button>
    </div>
  );
}
