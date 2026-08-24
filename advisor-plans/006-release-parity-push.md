# Plan 006: Run the release parity gate and push

> **Executor instructions**: Do not claim completion until every command and browser gate passes.
> Keep logical commits separate, rebase only if necessary, and push `main` to `origin` after final
> verification. Update the plan index.
>
> **Drift check**: `rtk git status --short --branch`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: Plans 001–005
- **Category**: tests, release
- **Planned at**: commit `cc1ab81`, 2026-08-24

## Release matrix

### Residual browser findings to close before the final matrix

- At 480px, Area Basic renders 11 X labels while the original preserves the end label by dropping
  November and renders 10. Match the original thinning without introducing overlap.
- Curve examples currently use four Y ticks capped at 1500; the original uses five ticks through 1800. Match both the endpoints and tick count while keeping the general dense-axis fix.
- Top/bottom legends sit about 5px closer to the plot edge than the original across families.
- At the same pointer coordinate, the basic Area tooltip selects July while the original selects
  June. Match the original category hit boundary without regressing Line, selection, or brush.
- Loading examples must suppress legends and other interactive chrome exactly as the original does;
  only the loading indicator and skeleton belong on screen.
- Recheck the reported mobile polar/bar size differences after a hard wait beyond the original's
  longest staggered intro. The ratios resemble partially sampled entrance progress, so do not alter
  settled geometry unless the mismatch survives a 2.5-second wait and replay completion.
- Recheck Pie labels against the original DOM after the full intro. The original source explicitly
  composes its label part, so do not remove working labels based only on a visual sample.
- Confirm Radial and Pie tooltip differences with equivalent pointer paths; match the original only
  after distinguishing intended family behavior from different hit coordinates.
- The copy sweep still finds `composible` in Bar, Line, Radar, and Sankey documentation. Replace it
  with concise `composable` copy and rerun the literal-entity search.

1. Run `rtk pnpm check`, `rtk pnpm lint`, `rtk pnpm test:unit -- --run`, `rtk pnpm build`, and
   `rtk pnpm exec playwright test`. All must exit 0 with no console/a11y warnings.
2. Regenerate registry artifacts once and confirm a second generation produces no diff.
3. Use T3 preview with the original on localhost:3000 and the port on 5173. Compare every chart
   family and shared UI primitive in light/dark at 1280x720 and 480x320. Measure tick text/count,
   SVG geometry, fills, strokes, legends, tooltips, selection, loading, brush, and intro progress.
4. Verify homepage and docs at 320x568, 1280x800, and 1920x1080. Confirm literal code blocks, TOC
   scroll state, Svelte badge, Mathis attribution, correct port links/star count, and no clipping.
5. Run the dither matrix in Plan 005 and confirm no idle RAF after settling.
6. Inspect `rtk git diff --check`, `rtk git status --short`, recent commit boundaries, and nested
   reference status. The original reference must remain unchanged; dither-kit must be ignored.
7. Push with `rtk git push origin main`. Confirm `main` and `origin/main` point to the same SHA.

## Done criteria

- [ ] All automated and browser gates pass.
- [ ] No uncommitted product changes remain.
- [ ] Multiple logical commits describe docs/identity, parity/hygiene, and dither work.
- [ ] `origin/main` contains the verified result.

## STOP conditions

Do not push if any gate fails, generated output is nondeterministic, references were modified, or a
browser comparison still shows a must-fix geometry, motion, interaction, accessibility, or console
defect.
