# Contributing

Thanks for taking the time to contribute. This is a template, so the bar is
simple: keep it clean, typed, and easy to fork.

## Getting set up

```bash
pnpm install
cp .env.example .env   # fill in DATABASE_URL + JWT_SECRET at minimum
pnpm db:push           # apply migrations
pnpm dev
```

See the [README](./README.md) for full setup and the config/adapter map.

## Before you open a PR

- `pnpm check` — type-checks the whole project (must pass).
- `pnpm test` — runs the Vitest suite (must pass).
- `pnpm format` — Prettier; run it so diffs stay small.

## Guidelines

- **Keep the smallest diff that solves the problem.** Touch only the files the
  change requires.
- **Match the existing style.** No new lint config, no reformatting unrelated code.
- **Stay adapter-friendly.** Provider-specific logic belongs behind the seams in
  `server/adapters/*`, not sprinkled through routers or pages.
- **No secrets, no brand names.** Never commit `.env`, keys, or hard-coded
  provider URLs. Defaults belong in `.env.example`.
- **Document behavior changes.** If you change setup or config, update the README
  and `.env.example` in the same PR.

## Reporting bugs

Open an issue with: what you expected, what happened, and the minimal steps to
reproduce. A failing test is the best possible bug report.
