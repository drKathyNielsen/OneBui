import { describe, it, expect, vi, afterEach } from 'vitest';

// The loader builds its manifest at import time, so each case resets the module
// registry and re-imports it with the flag in the state under test.
async function loadMetros() {
  vi.resetModules();
  const { metrosPromise } = await import('./digests');
  return metrosPromise;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('fixture digests', () => {
  it('are merged in when VITE_A11Y_FIXTURES is set', async () => {
    vi.stubEnv('VITE_A11Y_FIXTURES', '1');
    const metros = await loadMetros();
    expect(metros.map((m) => m.slug)).toContain('a11y-fixture');
  });

  it('are omitted when the flag is unset, so a reader never sees a fixture metro', async () => {
    vi.stubEnv('VITE_A11Y_FIXTURES', '');
    const metros = await loadMetros();
    expect(metros.map((m) => m.slug)).not.toContain('a11y-fixture');
    expect(metros.length).toBeGreaterThan(0);
  });
});
