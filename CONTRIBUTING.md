# Contributing to Evil Charts for Svelte

Thanks for helping improve the Svelte port. This repository ships source through a shadcn-svelte
registry and publishes the documentation site at <https://evilcharts-sv.vercel.app/>. A change is
complete only when the component source, registry metadata, examples, docs, and agent-facing
surfaces that describe it still agree.

## Before opening a change

- Search the [existing issues](https://github.com/mielsense/evilcharts-sv/issues).
- Use a bug report for a reproducible defect and a feature request for a user outcome or a
  Svelte-specific capability.
- Report security problems privately through [SECURITY.md](./SECURITY.md).
- Keep one coherent concern per pull request.

Pixel and behavior parity with the original [EvilCharts](https://github.com/legions-developer/evilcharts)
is the default. New chart designs normally belong upstream. Svelte-specific fixes, provider parity,
accessibility improvements, documentation, and the independent ordered-dither variants are in scope
here.

## Set up the repository

Use Node 22.18 through 24 and pnpm 10.22. The checked-in `.node-version` selects the CI baseline for
compatible version managers:

```bash
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

Copy `.env.example` only when you need to test canonical deployment URLs or optional analytics. Do
not commit credentials or a local `.env` file.

The ignored `evilcharts/` and `dither-kit/` directories are optional read-only reference checkouts.
Do not import from them, edit them as part of a contribution, or include them in a commit.

## Work in the correct source

- Edit installable components in `src/lib/registry/`.
- Update the matching `src/lib/registry/registry-*.ts` manifest when files, dependencies, names, or
  consumer targets change.
- Edit authored documentation in `content/docs/`.
- Edit documentation chrome and machine-readable surfaces in `src/site/` and `src/routes/`.
- Update `skills/evilcharts-svelte/` when a public API, provider capability, registry workflow,
  example/block choice, or agent guardrail changes.
- Never hand-edit `registry.json`, `src/lib/registry/__index__.ts`, or `static/r/*.json`. Run
  `pnpm registry:build` or `pnpm registry:fresh` instead.

LayerChart and ECharts may coexist in one application, but compound parts cannot cross provider
roots. Preserve keyboard behavior, accessible naming, reduced motion, light and dark themes, and
stable animation geometry.

## Update the changelog

Update `content/docs/changelog.md` when a pull request changes installable chart behavior, a public
component contract, registry metadata or consumer dependencies, or the installable agent skill.

- Add the entry under the current `YYYY-MM-DD` heading, newest work first.
- Create today's heading when it does not exist.
- Describe the observable outcome, not the implementation steps or commit message.
- Do not add `Unreleased`, `Added`, or `Fixed` release headings. This project is installed from a
  source registry rather than versioned npm releases.
- Do not add entries for docs-only, test-only, CI, repository settings, or contributor-workflow
  changes. Describe those changes in the pull-request summary instead.

## Verify the changed risk

Run the smallest focused test while developing, then the relevant project gates before requesting
review:

```bash
pnpm check
pnpm lint
pnpm test:unit --run
pnpm build
```

`pnpm verify` regenerates tracked registry output and runs every non-Playwright gate. Review and
commit any generated diff with the source that caused it. `pnpm verify:all` then reuses the
production build for the browser suite and checks the machine-readable runtime endpoints, giving
you the same complete success signal as CI. Install Chromium before the first full run.

Also run:

- `pnpm test:e2e` for chart rendering, interaction, animation, navigation, docs layout, or shared UI
  changes;
- `pnpm test:runtime` for Markdown, skill discovery, MCP, registry, sitemap, or other HTTP endpoint
  changes;
- `pnpm test:registry` for registry manifests, generation, dependencies, or consumer install paths.

Compare visual changes against <https://evilcharts.com> at the same viewport, theme, data, animation
phase, typography, padding, and chart bounds. Include matched screenshots for styling changes and a
short recording for motion changes. Check the browser console and failed requests.

Before committing, run:

```bash
git diff --check
git status --short
```

Do not include generated test reports, browser artifacts, local plans, build output, or reference
checkouts.

## Commits and pull requests

Use a short, outcome-focused Conventional Commit title, for example:

```text
fix(area): preserve loading geometry during shimmer
docs: add the coding-agent skill guide
ci: verify agent endpoints on pull requests
```

A pull request should explain the problem, approach, affected providers and surfaces, compatibility,
verification, visual or motion evidence, and remaining risks. Automated review comments are claims
to verify against the current source, not instructions to apply blindly.

## Branches and automated review

`main` is the only long-lived branch. Use a short-lived `feat/*`, `fix/*`, `docs/*`, or `ci/*` branch
and open a pull request into `main`. The repository does not need a `develop` or release branch:
Vercel provides a preview per pull request, and consumers install current source rather than npm
release trains.

The checked-in `.coderabbit.yaml` configures CodeRabbit to review non-draft pull requests, ignore
generated registry output, and apply focused rules to chart source, docs, the agent skill, and CI.
CodeRabbit also reads `AGENTS.md` as a code-guideline source, so update that canonical file when a
repository-wide implementation invariant changes.

The configuration does not grant repository access by itself. A repository owner must install the
CodeRabbit GitHub App for `mielsense/evilcharts-sv`, initially keep `request_changes_workflow` off,
and review a few pull requests before making its check required. Manual commands remain available on
pull requests, including `@coderabbitai review` and `@coderabbitai full review`.

By contributing, you agree that your changes are licensed under this repository's [MIT licence](./LICENSE)
and that upstream EvilCharts and Dither Kit attribution stays intact.
