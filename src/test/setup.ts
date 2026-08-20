import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// RTL only auto-cleans when Vitest globals are enabled; they are not, so unmount
// between tests explicitly to keep rendered trees from leaking across cases.
afterEach(cleanup);
