# EvilCharts SV completion plans

Generated with the improve skill on 2026-08-24. Execute in order. Every executor must read its
plan fully, preserve the nested `evilcharts/` and `dither-kit/` references, and update this table.

## Execution order and status

| Plan | Title | Priority | Effort | Depends on | Status |
| --- | --- | --- | --- | --- | --- |
| 001 | Repair docs rendering and navigation | P1 | M | — | DONE |
| 002 | Correct project identity and public copy | P1 | M | 001 | DONE |
| 003 | Restore chart API and runtime parity | P1 | L | 001 | DONE |
| 004 | Remove Svelte runtime and accessibility defects | P1 | L | 003 | DONE |
| 005 | Add dither chart variants | P1 | L | 002, 003, 004 | TODO |
| 006 | Run the release parity gate and push | P1 | M | 001–005 | TODO |

Status values: TODO | IN PROGRESS | DONE | BLOCKED | REJECTED.

## Dependency notes

- Plan 002 follows 001 because both touch the docs shell and generated documentation.
- Plan 004 follows 003 because animation and loading fixes overlap the chart marks.
- Plan 005 is last by request and reuses the corrected chart APIs rather than creating another
  chart system.
- Plan 006 owns final registry generation, browser comparison, commits, and push.

## Findings considered and rejected

- Porting dither-kit's React roots, CLI, contexts, axes, tooltip, legend, and standalone button,
  avatar, and gradient components: rejected because EvilCharts already owns those systems and the
  requested result is one library.
- Adding dither styles to radial bar and Sankey charts: rejected because dither-kit has no matching
  painter and inventing one would not be source parity.
- Copying dither-kit's source verbatim: rejected because its repository declares MIT in package
  metadata but does not include an authoritative license notice. The implementation must be an
  independent Svelte/LayerChart renderer with clear inspiration credit.
