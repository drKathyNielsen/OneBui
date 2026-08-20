import { useState } from 'react';

export interface Paging<T> {
  visible: T[]; // the current page's slice, in generator order
  page: number; // 1-based
  pageCount: number; // at least 1, so an empty section still has "a page"
  next: () => void;
  prev: () => void;
}

// Bidirectional paging over a complete candidate set. Every section owns its own
// instance with its own page size (see section-pagination): the digest contract
// emits unbounded ordered sets and leaves the display bound to the UI.
export function usePaging<T>(items: T[], pageSize: number): Paging<T> {
  const [page, setPage] = useState(1);

  // Reset when the underlying document changes. `vm` is rebuilt with fresh
  // arrays on every day/period/metro switch, so array identity changes exactly
  // then. Adjusted during render (React's prop-driven-state-reset pattern)
  // rather than in an effect, to avoid an extra render pass.
  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    setPage(1);
  }

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  // Derived, not trusted: a section that shrank in place can never strand the
  // reader on a page that no longer exists.
  const current = Math.min(page, pageCount);
  const start = (current - 1) * pageSize;

  return {
    visible: items.slice(start, start + pageSize),
    page: current,
    pageCount,
    next: () => setPage((p) => Math.min(p + 1, pageCount)),
    prev: () => setPage((p) => Math.max(p - 1, 1)),
  };
}
