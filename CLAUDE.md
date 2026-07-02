# Purrly — Agent Instructions

## Framework precedence (resolves the multi-framework pileup)

Multiple skill/agent frameworks coexist in this repo. Apply them in this order;
higher wins on conflict:

1. **User instructions** (this file, direct requests) — always win.
2. **superpowers** (installed, v6.0.3) — owns process discipline:
   brainstorming → writing-plans → TDD → code-review. This is the default
   planning/review pipeline.
3. **`.impeccable/critique`**, **`.sixth/skills`**, **`.agent/` workflows** —
   use only when explicitly invoked. They do NOT override superpowers' phase
   ownership. Do not run two planning or two review frameworks for one task.
4. **BMAD** — NOT adopted. Borrow `bmad-review-adversarial-general` as a manual
   `/`-invoked sanity check only; do not add BMAD's PM/architect/PRD ceremony.

## Setup (run once per clone)

Git hook activation is local config and does NOT travel with the repo. After
cloning, enable the secret-scanning pre-commit guard:

```bash
./scripts/setup-hooks.sh    # or: git config core.hooksPath scripts/git-hooks
```

## Secrets

- Provider routing + API keys live in `.claude/settings.local.json` (gitignored).
- `.claude/settings.json` is committed — never put secrets in it.
- Note: this project routes to a non-Anthropic model (Qwen via OpenRouter).
  superpowers/BMAD skills are tuned for Claude/Codex/Gemini and are unverified
  on that model — treat their behavioral guarantees as best-effort here.
