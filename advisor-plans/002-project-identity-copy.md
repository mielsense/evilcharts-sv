# Plan 002: Correct project identity and public copy

> **Executor instructions**: Apply the unslop rules to user-facing copy. Preserve precise credit to
> upstream EvilCharts. Work on `main`, make one logical commit, and update the plan index.
>
> **Drift check**: `rtk git diff --stat cc1ab81..HEAD -- README.md LICENSE package.json src/routes/+page.svelte src/site content`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: Plan 001
- **Category**: docs, bug
- **Planned at**: commit `cc1ab81`, 2026-08-24

## Why this matters

The site links to the wrong port repository, fetches the original project's star count, attributes
the Svelte work to Gurbinder, and hides the port identity. README install links still target the
React site. The corrected copy must name Mathis as the Svelte port author while crediting Gurbinder
for the original EvilCharts design and React implementation.

## Current state

- Port repo: `https://github.com/mielsense/evilcharts-sv`; owner profile:
  `https://github.com/mielsense`; live star count was 1 on 2026-08-24.
- Public site and registry base: `https://evilcharts-sv.vercel.app/`.
- `use-github-stars.ts` fetches `legions-developer/evilcharts` and logs fetch failures.
- `+page.svelte` hardcodes `legions-developer/evilcharts-svelte` and over-credits all prose/API to
  upstream. `docs-header.svelte` says “Built by Gurbinder”. `package.json` has the same wrong repo.
- Keep links to `https://github.com/legions-developer/evilcharts` where they explicitly identify the
  original project. Do not blanket-replace upstream links.

## Scope

In scope: README, package metadata, site constants/star hook/tests, homepage/header, agent docs,
docs intro/installation copy, and LICENSE wording about port authorship. Dither attribution is Plan 005. Out of scope: chart behavior.

## Steps

1. Centralize port author/repo/site constants and use them everywhere. Fetch stars for
   `mielsense/evilcharts-sv`, validate `stargazers_count` is numeric, return null without console noise
   on network/schema failure, and test success/failure.
2. Add an unmistakable `Svelte 5 port` badge using Svelte orange `#ff3e00` on the homepage. Keep the
   wordmark visually primary. Rewrite the intro in plain language: Svelte 5, LayerChart, installable
   source, port by Mathis; original design and React implementation by Gurbinder. Avoid marketing
   filler and em dashes.
3. Make the docs header link the Svelte badge/port repo, show the port's live star count, and say
   “Built by Mathis” linked to mielsense. Retain a compact “Based on EvilCharts” upstream link.
4. Update README install examples and docs URLs to the Vercel site, package repository/homepage, and
   generated llms/skill copy. Rewrite awkward or inaccurate docs prose with unslop while preserving
   technical meaning.
5. Verify homepage at desktop/mobile and ensure badge/text never clip. Verify all GitHub buttons point
   at the port and display `1` when the API fixture returns 1.

## Done criteria

- [ ] No port link contains `legions-developer/evilcharts-svelte`.
- [ ] Star fetch and both buttons target `mielsense/evilcharts-sv`.
- [ ] Homepage and docs explicitly say Svelte 5 and credit Mathis.
- [ ] Upstream EvilCharts/Gurbinder credit remains precise and linked.
- [ ] README installs from `https://evilcharts-sv.vercel.app/r/...` and links the live docs.
- [ ] Package metadata points to the port repo.
- [ ] Check, unit tests, lint, and browser responsive checks pass.

## STOP conditions

Stop if a requested authorship statement conflicts with a copyright notice in the upstream LICENSE.
Do not remove upstream credit or imply upstream affiliation.
