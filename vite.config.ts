import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import feedbackApi from './vite-plugin-feedback.ts'

// https://vite.dev/config/
export default defineConfig({
  // feedbackApi is dev/preview-only (see vite-plugin-feedback.ts) — a demo
  // sink for the article thumbs up/down control, not a production endpoint.
  plugins: [react(), feedbackApi()],
})
