import type { Connect, Plugin } from 'vite';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

// Demo-only feedback sink for the thumbs up/down control (see
// src/components/ArticleFeedback.tsx). POSTs to /api/feedback append one
// NDJSON line per vote to feedback/feedback.ndjson (gitignored).
//
// This only runs inside Vite's own dev/preview server (`npm run dev` /
// `npm run preview`) via configureServer/configurePreviewServer below. It is
// NOT available in production: render.yaml deploys OneBui as a static site
// (no Node process serving requests), so this endpoint is local-demo-only —
// "just to show we can get feedback," not a real collection pipeline.
const LOG_PATH = path.resolve(import.meta.dirname, 'feedback/feedback.ndjson');

interface FeedbackBody {
  uid: string;
  title: string;
  vote: 'up' | 'down' | null;
}

function isFeedbackBody(v: unknown): v is FeedbackBody {
  const b = v as Partial<FeedbackBody> | null;
  return (
    !!b &&
    typeof b.uid === 'string' &&
    b.uid.length > 0 &&
    typeof b.title === 'string' &&
    (b.vote === 'up' || b.vote === 'down' || b.vote === null)
  );
}

function feedbackMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    if (req.method !== 'POST' || req.url !== '/api/feedback') {
      next();
      return;
    }
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      void (async () => {
        try {
          const parsed: unknown = JSON.parse(raw);
          if (!isFeedbackBody(parsed)) throw new Error('invalid body');
          const entry = { ...parsed, at: new Date().toISOString() };
          await mkdir(path.dirname(LOG_PATH), { recursive: true });
          await appendFile(LOG_PATH, JSON.stringify(entry) + '\n');
          res.statusCode = 204;
          res.end();
        } catch {
          res.statusCode = 400;
          res.end('bad request');
        }
      })();
    });
  };
}

export default function feedbackApi(): Plugin {
  return {
    name: 'feedback-api',
    configureServer(server) {
      server.middlewares.use(feedbackMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(feedbackMiddleware());
    },
  };
}
