# AGENTS.md

## Project

Evil Charts SV is the Svelte 5 port of EvilCharts. It ships copy-paste chart components through a
shadcn-svelte registry. It provides parallel LayerChart and Apache ECharts implementations;
LayerChart uses `@humanspeak/svelte-motion` for motion, while ECharts uses its native Canvas/SVG
runtime. The documentation site is part of the product: examples, install commands,
machine-readable docs, and registry output must stay aligned.

Pixel and behavior parity with the original EvilCharts project is the default. The locally ignored
`evilcharts/` checkout is the visual and interaction reference; it is not a dependency and must not
be edited, imported, or committed. The locally ignored `dither-kit/` checkout is reference material
for the independent ordered-dither variants. Preserve the upstream credits and license boundaries.

## Repository map

- `src/lib/registry/charts/{layerchart,echarts}-*`: installable compound chart components.
- `src/lib/registry/ui/{layerchart,echarts}-*`: provider-specific chart primitives.
- `src/lib/registry/examples/{layerchart,echarts}/`: focused documentation examples (`ex-*`).
- `src/lib/registry/blocks/{layerchart,echarts}/`: composed dashboard blocks (`b-*`).
- `src/lib/registry/registry-*.ts`: registry manifests, consumer dependencies, and target paths.
- `content/docs/`: authored documentation.
- `src/site/`: docs chrome, previews, source loading, highlighting, and agent surfaces.
- `src/routes/`: SvelteKit pages and machine-readable endpoints.
- `scripts/build-registry.ts`: registry generator.
- `skills/evilcharts-svelte/`: the installable coding-agent skill and its bundled references.
- `.github/`: CI, dependency updates, and contribution templates.
- `.coderabbit.yaml`: automated review scope; CodeRabbit reads this file and `AGENTS.md`.

## Source and generated files

Edit source components and the matching `registry-*.ts` manifest. Do not hand-edit generated files.
Run `pnpm registry:build` after registry changes.

Generated outputs are:

- `registry.json` (tracked)
- `src/lib/registry/__index__.ts` (tracked)
- `static/r/*.json` (generated and ignored)

`pnpm build` runs a clean registry generation before the production build.

When a public component, prop, provider capability, registry name, example, or block changes, review
the agent skill and both bundled references. Update them when an agent's provider choice, install
command, composition, or guardrails would otherwise become stale.

## Implementation standards

- Use modern Svelte 5: runes, snippets, typed props, and attachments where appropriate. Do not add
  mixed legacy reactive syntax.
- Follow current LayerChart, `@humanspeak/svelte-motion`, and Apache ECharts APIs. Check their
  current documentation before changing provider-specific behavior.
- Keep chart roots responsible for data, config, shared selection, and compound-component context.
  Keep visual children small and composable.
- Preserve accessibility, keyboard behavior, reduced-motion behavior, transparent SVG interaction
  targets, and light/dark themes.
- Animation changes must be deterministic. Geometry should remain stable unless geometry itself is
  intentionally animated. A moving dashed stroke changes dash offset, not the full chart opacity.
- Treat the original implementation as a measurable reference. Compare identical viewport, theme,
  data, animation phase, typography, padding, and chart bounds before accepting a deviation.
- Blocks are complete product compositions with supporting information and responsive layout. Do
  not publish a plain chart demo as a block. Previews must fit without nested page scrollbars or
  clipped chart chrome.
- Keep documentation direct and factual. Inline API names use the shared code treatment; code
  blocks use the shared Svelte/TypeScript syntax-highlighting pipeline.
- Add or update focused regression tests with behavior changes. Prefer observable invariants over
  snapshots of implementation details.
- Update `content/docs/changelog.md` when installable chart behavior, a public component contract,
  registry metadata, consumer dependencies, or the installable agent skill changes. Docs-only,
  test-only, CI, and contributor-workflow changes belong in the pull-request description instead.
  Follow the dated-entry policy in `CONTRIBUTING.md`; this registry does not use an `Unreleased`
  section.

## Working safely

- Preserve unrelated user changes in a dirty worktree.
- Do not modify or commit `evilcharts/`, `dither-kit/`, local agent configuration, build output,
  browser artifacts, or temporary measurement scripts.
- When using a development server, record the process/session you started and stop only that one.
- Never deploy, publish packages, push, rewrite history, or delete remote data unless the user has
  explicitly authorized that operation.
- Keep attribution intact when translating upstream designs. Document a deliberate parity exception
  in the affected provider page and dated changelog entry, including the measurement and reason.

## Commands

```bash
pnpm install
pnpm dev

pnpm check
pnpm lint
pnpm test:unit --run
pnpm test:e2e
pnpm test:runtime
pnpm build

pnpm registry:build
pnpm registry:fresh
pnpm verify
pnpm verify:all
```

Use the full Playwright suite for shared chart primitives, layout, navigation, animation, docs
rendering, or registry-wide changes. This repository publishes a source registry, not an npm
package: a production build validates registry generation and SvelteKit, while `pnpm test:registry`
installs representative generated items into an isolated consumer and runs strict `svelte-check`.
`pnpm verify` is the complete non-Playwright gate used before a handoff; CI adds both Playwright
suites and rejects an uncommitted generated registry diff. `pnpm verify:all` reuses the production
build for browser coverage, then checks the runtime endpoints to reproduce the complete CI gate.

## Definition of done

1. Compare the affected page or component with the original in a real browser at matching desktop
   and mobile sizes, in both themes when styling is involved.
2. Check the browser console and network panel for warnings, exceptions, and failed requests.
3. Run `pnpm check`, `pnpm lint`, focused tests, the full unit suite, and the appropriate Playwright
   coverage. Run `pnpm build` for any shippable change.
4. Confirm generated registry files match their sources and install commands target
   `https://evilcharts-sv.vercel.app/`.
5. Update the dated changelog for installable library, registry-contract, or agent-skill changes.
   Keep affected provider docs, registry examples, machine-readable agent surfaces, and skill
   references aligned without recording docs-only work as a library change.
6. Run `git diff --check` and inspect `git status --short`. Leave no temporary files, test reports,
   accidental vendored sources, or unrelated changes.

Human contribution and review policy lives in `CONTRIBUTING.md`. Keep this file focused on repository
navigation, implementation invariants, safety, and change completeness rather than duplicating that
guide.
