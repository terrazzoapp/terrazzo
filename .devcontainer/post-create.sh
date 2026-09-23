#!/usr/bin/env bash
set -euo pipefail

sudo corepack enable
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
