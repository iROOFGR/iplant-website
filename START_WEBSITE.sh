#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
command -v node >/dev/null 2>&1 || { echo "Node.js LTS is required."; exit 1; }
rm -rf .next
[ -d node_modules ] || npm install
npm run validate:content
printf '\nStarting iPlant at http://localhost:5218/en\n'
npm run dev
