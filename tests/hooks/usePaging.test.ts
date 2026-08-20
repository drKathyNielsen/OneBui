import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePaging } from '../../src/hooks/usePaging';

const items = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

describe('usePaging', () => {
  it('slices the current page and clamps at both ends', () => {
    // Held in a const: the hook resets on array identity, so callers pass the
    // memoized view-model arrays rather than rebuilding one per render.
    const seven = items(7);
    const { result } = renderHook(() => usePaging(seven, 3));

    expect(result.current.visible).toEqual([1, 2, 3]);
    expect(result.current.page).toBe(1);
    expect(result.current.pageCount).toBe(3);

    act(() => result.current.prev()); // already first — no move
    expect(result.current.page).toBe(1);

    act(() => result.current.next());
    expect(result.current.visible).toEqual([4, 5, 6]);

    act(() => result.current.next());
    expect(result.current.visible).toEqual([7]); // partial final page
    expect(result.current.page).toBe(3);

    act(() => result.current.next()); // already last — no move
    expect(result.current.page).toBe(3);

    act(() => result.current.prev());
    expect(result.current.visible).toEqual([4, 5, 6]);
  });

  it('counts an exact final page without adding an empty one', () => {
    const six = items(6);
    const { result } = renderHook(() => usePaging(six, 3));
    expect(result.current.pageCount).toBe(2);
  });

  it('gives an empty array one empty page, so no controls are warranted', () => {
    const none: number[] = [];
    const { result } = renderHook(() => usePaging(none, 3));
    expect(result.current.visible).toEqual([]);
    expect(result.current.pageCount).toBe(1);
    expect(result.current.page).toBe(1);
  });

  it('resets to the first page when the items array identity changes', () => {
    const { result, rerender } = renderHook(({ list }) => usePaging(list, 3), {
      initialProps: { list: items(9) },
    });
    act(() => result.current.next());
    expect(result.current.page).toBe(2);

    rerender({ list: items(9) }); // a different document with the same length
    expect(result.current.page).toBe(1);
    expect(result.current.visible).toEqual([1, 2, 3]);
  });

  it('clamps rather than stranding the reader when the list shrinks', () => {
    const list = items(9);
    const { result, rerender } = renderHook(({ list }) => usePaging(list, 3), {
      initialProps: { list },
    });
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.page).toBe(3);

    // Same array identity (no reset), fewer entries: the stored page is now past
    // the end and must clamp to the last real page instead of rendering nothing.
    list.length = 4;
    rerender({ list });
    expect(result.current.page).toBe(2);
    expect(result.current.visible).toEqual([4]);
  });
});
