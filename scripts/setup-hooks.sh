#!/usr/bin/env bash
# Activate this repo's version-controlled git hooks (secret scanning).
# Run once after cloning. Idempotent.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
git config core.hooksPath scripts/git-hooks
chmod +x scripts/git-hooks/* 2>/dev/null || true
echo "✓ git hooks active (core.hooksPath=scripts/git-hooks)"
echo "  pre-commit secret scanning is now enforced for this clone."
