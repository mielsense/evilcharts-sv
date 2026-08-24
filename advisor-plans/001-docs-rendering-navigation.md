# Plan 001: Repair docs rendering and navigation

> **Executor instructions**: Follow every step and verification. Work on `main` in the shared
> workspace. Do not modify either nested reference repository. Commit this plan as one logical
> commit. Update `advisor-plans/README.md` when complete.
>
> **Drift check**: `rtk git diff --stat cc1ab81..HEAD -- src/site src/routes/docs content`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug, docs, tests
- **Planned at**: commit `cc1ab81`, 2026-08-24

## Why this matters

All Svelte examples currently render escaped entities such as `&lt;` and `&#123;`. The right-hand
table of contents has a displaced marker and an unreliable active state, small screens clip docs
header text, and page neighbours can resolve to duplicate static/canonical entries. These defects
make the documentation hard to read and navigate even though the chart code compiles.

## Current state

- `src/site/lib/mdsvex-code.ts:55-123` turns Shiki output into mdsvex HTML. The browser receives
  `&amp;lt;` and `&amp;#123;`, proving mdsvex escapes Shiki's entities a second time.
- The safe target shape is to keep highlighted HTML in a JavaScript string and insert it with a
  Svelte `{@html ...}` expression. Do not decode entities into literal tags inside template markup.
- `src/site/components/docs/mdx/components/toc-indicator.svelte.ts` computes path geometry.
  Port and original currently produce the same path, but the port marker is about 4px lower because
  CSS `rotate` is used where the original Motion output uses `transform: rotate(...)`.
- `table-of-content.svelte` uses IntersectionObserver and ResizeObserver. Make the scroll spy choose
  the last heading above a stable header offset and schedule ResizeObserver measurement in one
  animation frame to avoid loop notifications.
- `src/site/lib/source.ts` and `src/routes/docs/[...slug]/+page.ts` own neighbour resolution. Static
  and canonical variants of a page must collapse to one navigation entry.
- `src/site/components/docs/sidebar/docs-header.svelte` must remain usable at 320px without clipping.

## Commands

| Purpose | Command                                     | Expected                         |
| ------- | ------------------------------------------- | -------------------------------- |
| Check   | `rtk pnpm check`                            | 0 errors, 0 warnings             |
| Unit    | `rtk pnpm test:unit -- --run`               | all tests pass                   |
| Lint    | `rtk pnpm lint`                             | exit 0                           |
| Browser | T3 preview at `/docs/layerchart/line-chart` | rendered `<script>`, no entities |

## Scope

In scope: `src/site/lib/mdsvex-code.ts`, its tests, TOC files under
`src/site/components/docs/mdx/components/`, docs neighbour source/load files, responsive docs shell
files, and targeted tests. Out of scope: chart rendering code and nested references.

## Steps

1. Add a regression test around the mdsvex transform that compiles a Svelte code fence and asserts
   rendered text contains `<script>` and `{ data }`, never visible entity spellings. Change the
   transform to pass Shiki HTML through `{@html JSON.stringify(html)}` or an equivalent safe runtime
   CodeBlock prop. Remove Shiki's `tabindex=\"0\"` unless the code block is intentionally interactive,
   and keep each `figcaption` inside its `figure`.
2. Add pure tests for TOC path/active-heading selection. Fix marker transform/anchor geometry and use
   a deterministic scroll-position calculation that works in the nested docs scroller. Batch resize
   measurements with requestAnimationFrame and cancel pending work on destroy.
3. Deduplicate source pages by canonical URL before `findNeighbour` runs. Add first, middle, and last
   page navigation tests proving previous and next never point to the same content variant.
4. At 320px, make the header expose the sidebar trigger and a compact Svelte-port identity without
   horizontal clipping; hide secondary metadata before truncating the title.
5. Verify at 1280x800 and 320x568 in light and dark themes. Scroll from Installation through API
   Reference and confirm one correct active TOC item and a marker centered on its row.

## Done criteria

- [ ] No visible `&lt;`, `&gt;`, `&#123;`, or `&#125;` in rendered code blocks.
- [ ] Copy buttons copy literal Svelte source.
- [ ] TOC active item follows scroll and the marker is centered at every depth.
- [ ] No ResizeObserver-loop error while resizing the docs viewport.
- [ ] Neighbour URLs are unique and canonical.
- [ ] 320px docs header does not clip or overflow.
- [ ] Check, tests, and lint pass.

## STOP conditions

Stop only if mdsvex cannot safely receive a runtime HTML string without changing the public content
format, or if fixing neighbour duplication requires renaming published docs URLs. Report evidence;
do not change URLs silently.
