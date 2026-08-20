import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Test-only config, kept separate from vite.config.ts so the dev/preview-only
// feedback plugin never loads under test. Vitest prefers this file when present.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // No `globals: true` — tests import describe/it/expect from 'vitest'
    // explicitly, so nothing is injected into the ambient type space.
    restoreMocks: true,
  },
});
