#!/usr/bin/env bash
# Run the OneBui app locally on http://localhost:5173
#
#   ./run.sh          # dev server (hot reload)
#   ./run.sh build    # production build into dist/
#   ./run.sh preview  # build, then serve dist/ locally
#
# Vite 8 (rolldown) requires Node 20+. This script switches to the version in
# .nvmrc via nvm when available, and reinstalls node_modules if the native
# rolldown binding was built against a different Node version.
set -euo pipefail

cd "$(dirname "$0")"

# --- Ensure Node 20+ (prefer nvm, honoring .nvmrc) --------------------------
if command -v nvm >/dev/null 2>&1 || [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  nvm use >/dev/null 2>&1 || nvm install
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Error: Node 20+ is required (found $(node -v 2>/dev/null || echo none))." >&2
  echo "Install it with 'nvm install 20' or upgrade Node, then re-run." >&2
  exit 1
fi

# --- Install deps if missing ------------------------------------------------
if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

# --- Run --------------------------------------------------------------------
case "${1:-dev}" in
  build)   npm run build ;;
  preview) npm run build && npm run preview ;;
  dev|"")  npm run dev ;;
  *)       echo "Usage: ./run.sh [dev|build|preview]" >&2; exit 1 ;;
esac
