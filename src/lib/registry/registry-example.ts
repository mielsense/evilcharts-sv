/**
 * The documentation examples — one item per `ex-*` demo.
 *
 * Ported from `evilcharts/src/registry/registry-example.ts` — the recharts entries only, in the
 * reference's own order, renamed to the `layerchart` provider. Every entry is uniform: one file,
 * `registry:block`, and a single `registryDependencies` entry naming the chart it demonstrates.
 *
 * Like the reference, examples declare no `dependencies`: the packages they reach for beyond their
 * chart (icons, for instance) are already present in any shadcn-svelte project.
 */
import type { RegistryItem } from './schema.js';

export const examples: RegistryItem[] = [
	// Area chart
	{
		name: 'ex-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-area-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-brush-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-brush-area-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-gradient-colors-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-gradient-colors-area-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-gradient-colors-bump-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-gradient-colors-bump-area-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-loading-state-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-loading-state-area-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-default-type-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-default-type-area-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-stacked-type-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-stacked-type-area-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-expanded-type-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-expanded-type-area-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-bump-curve-type-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-bump-curve-type-area-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-step-curve-type-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-step-curve-type-area-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-monotoney-curve-type-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-monotoney-curve-type-area-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-solid-stroke-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-solid-stroke-area-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-dashed-stroke-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-dashed-stroke-area-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-animated-dashed-stroke-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-animated-dashed-stroke-area-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-gradient-area-variant-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-gradient-area-variant-area-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-gradient-reverse-area-variant-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-gradient-reverse-area-variant-area-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-solid-area-variant-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-solid-area-variant-area-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-dotted-area-variant-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-dotted-area-variant-area-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-lines-area-variant-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-lines-area-variant-area-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-hatched-area-variant-area-chart',
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-hatched-area-variant-area-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	// Line chart
	{
		name: 'ex-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-line-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-dot-default-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-dot-default-line-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-dot-border-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-dot-border-line-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-dot-colored-border-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-dot-colored-border-line-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-gradient-colors-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-gradient-colors-line-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-gradient-colors-bump-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-gradient-colors-bump-line-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-loading-state-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-loading-state-line-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-bump-curve-type-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-bump-curve-type-line-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-step-curve-type-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-step-curve-type-line-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-monotoney-curve-type-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-monotoney-curve-type-line-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-solid-stroke-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-solid-stroke-line-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-dashed-stroke-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-dashed-stroke-line-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-animated-dashed-stroke-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-animated-dashed-stroke-line-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-glowing-desktop-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-glowing-desktop-line-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-glowing-mobile-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-glowing-mobile-line-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-buffer-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-buffer-line-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-bg-dots-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-bg-dots-line-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-bg-grid-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-bg-grid-line-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-bg-cross-hatch-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-bg-cross-hatch-line-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-bg-diagonal-lines-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-bg-diagonal-lines-line-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-bg-plus-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-bg-plus-line-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-bg-falling-triangles-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-bg-falling-triangles-line-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-bg-4-pointed-star-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-bg-4-pointed-star-line-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-bg-tiny-checkers-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-bg-tiny-checkers-line-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-bg-overlapping-circles-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-bg-overlapping-circles-line-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-bg-wiggle-lines-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-bg-wiggle-lines-line-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-bg-bubbles-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-bg-bubbles-line-chart.svelte', type: 'registry:block' }]
	},
	// Bar chart
	{
		name: 'ex-buffer-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-buffer-bar-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-bar-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-gradient-colors-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-gradient-colors-bar-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-loading-state-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-loading-state-bar-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-default-variant-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-default-variant-bar-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-hatched-variant-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-hatched-variant-bar-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-duotone-variant-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-duotone-variant-bar-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-duotone-reverse-variant-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-duotone-reverse-variant-bar-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-gradient-variant-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-gradient-variant-bar-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-stripped-variant-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-stripped-variant-bar-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-stacked-type-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-stacked-type-bar-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-percent-type-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-percent-type-bar-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-horizontal-layout-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-horizontal-layout-bar-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-hover-highlight-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-hover-highlight-bar-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-glowing-desktop-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-glowing-desktop-bar-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-glowing-mobile-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-glowing-mobile-bar-chart.svelte', type: 'registry:block' }
		]
	},
	// Composed chart
	{
		name: 'ex-composed-chart',
		registryDependencies: ['@evilcharts/layerchart-composed-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-composed-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-gradient-colors-composed-chart',
		registryDependencies: ['@evilcharts/layerchart-composed-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-gradient-colors-composed-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-loading-state-composed-chart',
		registryDependencies: ['@evilcharts/layerchart-composed-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-loading-state-composed-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-hatched-variant-composed-chart',
		registryDependencies: ['@evilcharts/layerchart-composed-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-hatched-variant-composed-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-duotone-variant-composed-chart',
		registryDependencies: ['@evilcharts/layerchart-composed-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-duotone-variant-composed-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-gradient-variant-composed-chart',
		registryDependencies: ['@evilcharts/layerchart-composed-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-gradient-variant-composed-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-stripped-variant-composed-chart',
		registryDependencies: ['@evilcharts/layerchart-composed-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-stripped-variant-composed-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-dashed-stroke-composed-chart',
		registryDependencies: ['@evilcharts/layerchart-composed-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-dashed-stroke-composed-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-animated-dashed-stroke-composed-chart',
		registryDependencies: ['@evilcharts/layerchart-composed-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-animated-dashed-stroke-composed-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-bump-curve-composed-chart',
		registryDependencies: ['@evilcharts/layerchart-composed-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-bump-curve-composed-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-dots-composed-chart',
		registryDependencies: ['@evilcharts/layerchart-composed-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-dots-composed-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-hover-highlight-composed-chart',
		registryDependencies: ['@evilcharts/layerchart-composed-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-hover-highlight-composed-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-glowing-composed-chart',
		registryDependencies: ['@evilcharts/layerchart-composed-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-glowing-composed-chart.svelte', type: 'registry:block' }
		]
	},
	// Pie chart
	{
		name: 'ex-pie-chart',
		registryDependencies: ['@evilcharts/layerchart-pie-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-pie-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-gradient-colors-pie-chart',
		registryDependencies: ['@evilcharts/layerchart-pie-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-gradient-colors-pie-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-donut-pie-chart',
		registryDependencies: ['@evilcharts/layerchart-pie-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-donut-pie-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-padded-pie-chart',
		registryDependencies: ['@evilcharts/layerchart-pie-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-padded-pie-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-overlapping-padded-pie-chart',
		registryDependencies: ['@evilcharts/layerchart-pie-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-overlapping-padded-pie-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-labels-pie-chart',
		registryDependencies: ['@evilcharts/layerchart-pie-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-labels-pie-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-loading-state-pie-chart',
		registryDependencies: ['@evilcharts/layerchart-pie-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-loading-state-pie-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-glowing-pie-chart',
		registryDependencies: ['@evilcharts/layerchart-pie-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-glowing-pie-chart.svelte', type: 'registry:block' }]
	},
	// Radial chart
	{
		name: 'ex-radial-chart',
		registryDependencies: ['@evilcharts/layerchart-radial-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-radial-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-semi-variant-radial-chart',
		registryDependencies: ['@evilcharts/layerchart-radial-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-semi-variant-radial-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-gradient-colors-radial-chart',
		registryDependencies: ['@evilcharts/layerchart-radial-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-gradient-colors-radial-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-loading-state-radial-chart',
		registryDependencies: ['@evilcharts/layerchart-radial-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-loading-state-radial-chart.svelte', type: 'registry:block' }
		]
	},
	// Radar chart
	{
		name: 'ex-radar-chart',
		registryDependencies: ['@evilcharts/layerchart-radar-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-radar-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-lines-variant-radar-chart',
		registryDependencies: ['@evilcharts/layerchart-radar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-lines-variant-radar-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-circle-grid-radar-chart',
		registryDependencies: ['@evilcharts/layerchart-radar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-circle-grid-radar-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-gradient-colors-radar-chart',
		registryDependencies: ['@evilcharts/layerchart-radar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-gradient-colors-radar-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-loading-state-radar-chart',
		registryDependencies: ['@evilcharts/layerchart-radar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-loading-state-radar-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-glowing-radar-chart',
		registryDependencies: ['@evilcharts/layerchart-radar-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-glowing-radar-chart.svelte', type: 'registry:block' }]
	},
	// Sankey chart
	{
		name: 'ex-sankey-chart',
		registryDependencies: ['@evilcharts/layerchart-sankey-chart'],
		type: 'registry:block',
		files: [{ path: 'examples/layerchart/ex-sankey-chart.svelte', type: 'registry:block' }]
	},
	{
		name: 'ex-gradient-colors-sankey-chart',
		registryDependencies: ['@evilcharts/layerchart-sankey-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-gradient-colors-sankey-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-loading-state-sankey-chart',
		registryDependencies: ['@evilcharts/layerchart-sankey-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-loading-state-sankey-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-solid-link-variant-sankey-chart',
		registryDependencies: ['@evilcharts/layerchart-sankey-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-solid-link-variant-sankey-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-source-link-variant-sankey-chart',
		registryDependencies: ['@evilcharts/layerchart-sankey-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-source-link-variant-sankey-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-labeled-nodes-sankey-chart',
		registryDependencies: ['@evilcharts/layerchart-sankey-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-labeled-nodes-sankey-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-outside-labels-sankey-chart',
		registryDependencies: ['@evilcharts/layerchart-sankey-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-outside-labels-sankey-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-solid-labeled-nodes-sankey-chart',
		registryDependencies: ['@evilcharts/layerchart-sankey-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-solid-labeled-nodes-sankey-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	// Bar chart
	{
		name: 'ex-tooltip-default-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-tooltip-default-bar-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-tooltip-frosted-glass-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-tooltip-frosted-glass-bar-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	// Line chart
	{
		name: 'ex-legend-square-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-legend-square-line-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-legend-circle-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-legend-circle-line-chart.svelte', type: 'registry:block' }
		]
	},
	{
		name: 'ex-legend-circle-outline-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-legend-circle-outline-line-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-legend-rounded-square-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-legend-rounded-square-line-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-legend-rounded-square-outline-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-legend-rounded-square-outline-line-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-legend-vertical-bar-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-legend-vertical-bar-line-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-legend-horizontal-bar-line-chart',
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-legend-horizontal-bar-line-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	// Bar chart
	{
		name: 'ex-chart-config-default-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [
			{
				path: 'examples/layerchart/ex-chart-config-default-bar-chart.svelte',
				type: 'registry:block'
			}
		]
	},
	{
		name: 'ex-chart-config-icons-bar-chart',
		registryDependencies: ['@evilcharts/layerchart-bar-chart'],
		type: 'registry:block',
		files: [
			{ path: 'examples/layerchart/ex-chart-config-icons-bar-chart.svelte', type: 'registry:block' }
		]
	},
	// Dither rendering examples
	...[
		['area', 'layerchart-area-chart'],
		['line', 'layerchart-line-chart'],
		['bar', 'layerchart-bar-chart'],
		['composed', 'layerchart-composed-chart'],
		['pie', 'layerchart-pie-chart'],
		['radar', 'layerchart-radar-chart']
	].map(([family, dependency]) => ({
		name: `ex-dither-${family}-chart`,
		registryDependencies: [`@evilcharts/${dependency}`],
		type: 'registry:block' as const,
		files: [
			{
				path: `examples/layerchart/ex-dither-${family}-chart.svelte`,
				type: 'registry:block' as const
			}
		]
	}))
];
