/**
 * The documentation examples — one item per `ex-*` demo.
 *
 * Ported from `evilcharts/src/registry/registry-example.ts`: Recharts demos are translated to the
 * `layerchart` provider, and ECharts demos retain their provider-specific names. Every entry ships
 * one file and names the chart it demonstrates as a registry dependency.
 *
 * Like the reference, examples declare no `dependencies`: the packages they reach for beyond their
 * chart (icons, for instance) are already present in any shadcn-svelte project.
 */
import type { RegistryItem } from './schema.js';

const layerchartExamples: RegistryItem[] = [
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

const echartsExampleNames = [
	'ex-animated-dashed-stroke-echarts-area-chart',
	'ex-animated-dashed-stroke-echarts-composed-chart',
	'ex-animated-dashed-stroke-echarts-line-chart',
	'ex-blocks-variant-echarts-bar-chart',
	'ex-brush-echarts-area-chart',
	'ex-buffer-echarts-area-chart',
	'ex-buffer-echarts-bar-chart',
	'ex-buffer-echarts-line-chart',
	'ex-bump-curve-echarts-composed-chart',
	'ex-bump-curve-type-echarts-area-chart',
	'ex-bump-curve-type-echarts-line-chart',
	'ex-chart-config-default-echarts-bar-chart',
	'ex-chart-config-icons-echarts-bar-chart',
	'ex-circle-grid-echarts-radar-chart',
	'ex-dashed-stroke-echarts-area-chart',
	'ex-dashed-stroke-echarts-composed-chart',
	'ex-dashed-stroke-echarts-line-chart',
	'ex-dither-echarts-area-chart',
	'ex-dither-echarts-bar-chart',
	'ex-dither-echarts-composed-chart',
	'ex-dither-echarts-line-chart',
	'ex-dither-echarts-pie-chart',
	'ex-dither-echarts-radar-chart',
	'ex-default-type-echarts-area-chart',
	'ex-default-variant-echarts-bar-chart',
	'ex-donut-echarts-pie-chart',
	'ex-dot-border-echarts-line-chart',
	'ex-dot-colored-border-echarts-line-chart',
	'ex-dot-default-echarts-line-chart',
	'ex-dot-ping-echarts-line-chart',
	'ex-dots-echarts-composed-chart',
	'ex-dotted-area-variant-echarts-area-chart',
	'ex-duotone-reverse-variant-echarts-bar-chart',
	'ex-duotone-variant-echarts-bar-chart',
	'ex-duotone-variant-echarts-composed-chart',
	'ex-echarts-area-chart',
	'ex-echarts-bar-chart',
	'ex-echarts-composed-chart',
	'ex-echarts-line-chart',
	'ex-echarts-pie-chart',
	'ex-echarts-radar-chart',
	'ex-echarts-radial-chart',
	'ex-echarts-sankey-chart',
	'ex-expandable-variant-echarts-bar-chart',
	'ex-expanded-type-echarts-area-chart',
	'ex-glowing-desktop-echarts-bar-chart',
	'ex-glowing-desktop-echarts-line-chart',
	'ex-glowing-echarts-composed-chart',
	'ex-glowing-mobile-echarts-bar-chart',
	'ex-glowing-mobile-echarts-line-chart',
	'ex-gradient-area-variant-echarts-area-chart',
	'ex-gradient-colors-bump-echarts-area-chart',
	'ex-gradient-colors-bump-echarts-line-chart',
	'ex-gradient-colors-echarts-area-chart',
	'ex-gradient-colors-echarts-bar-chart',
	'ex-gradient-colors-echarts-composed-chart',
	'ex-gradient-colors-echarts-line-chart',
	'ex-gradient-colors-echarts-pie-chart',
	'ex-gradient-colors-echarts-radar-chart',
	'ex-gradient-colors-echarts-radial-chart',
	'ex-gradient-colors-echarts-sankey-chart',
	'ex-gradient-reverse-area-variant-echarts-area-chart',
	'ex-gradient-variant-echarts-bar-chart',
	'ex-gradient-variant-echarts-composed-chart',
	'ex-hatched-area-variant-echarts-area-chart',
	'ex-hatched-variant-echarts-bar-chart',
	'ex-hatched-variant-echarts-composed-chart',
	'ex-horizontal-layout-echarts-bar-chart',
	'ex-hover-highlight-echarts-area-chart',
	'ex-hover-highlight-echarts-bar-chart',
	'ex-hover-highlight-echarts-composed-chart',
	'ex-hover-reveal-echarts-area-chart',
	'ex-hover-reveal-echarts-line-chart',
	'ex-labeled-nodes-echarts-sankey-chart',
	'ex-labels-echarts-pie-chart',
	'ex-legend-circle-echarts-line-chart',
	'ex-legend-circle-outline-echarts-line-chart',
	'ex-legend-horizontal-bar-echarts-line-chart',
	'ex-legend-rounded-square-echarts-line-chart',
	'ex-legend-rounded-square-outline-echarts-line-chart',
	'ex-legend-square-echarts-line-chart',
	'ex-legend-vertical-bar-echarts-line-chart',
	'ex-lines-area-variant-echarts-area-chart',
	'ex-lines-variant-echarts-radar-chart',
	'ex-loading-state-echarts-area-chart',
	'ex-loading-state-echarts-bar-chart',
	'ex-loading-state-echarts-composed-chart',
	'ex-loading-state-echarts-line-chart',
	'ex-loading-state-echarts-pie-chart',
	'ex-loading-state-echarts-radar-chart',
	'ex-loading-state-echarts-radial-chart',
	'ex-loading-state-echarts-sankey-chart',
	'ex-max-highlight-echarts-bar-chart',
	'ex-monotoney-curve-type-echarts-area-chart',
	'ex-monotoney-curve-type-echarts-line-chart',
	'ex-outside-labels-echarts-pie-chart',
	'ex-outside-labels-echarts-sankey-chart',
	'ex-overlapping-padded-echarts-pie-chart',
	'ex-padded-echarts-pie-chart',
	'ex-percent-type-echarts-bar-chart',
	'ex-semi-variant-echarts-radial-chart',
	'ex-solid-area-variant-echarts-area-chart',
	'ex-solid-labeled-nodes-echarts-sankey-chart',
	'ex-solid-link-variant-echarts-sankey-chart',
	'ex-solid-stroke-echarts-area-chart',
	'ex-solid-stroke-echarts-line-chart',
	'ex-source-link-variant-echarts-sankey-chart',
	'ex-stacked-type-echarts-area-chart',
	'ex-stacked-type-echarts-bar-chart',
	'ex-step-curve-type-echarts-area-chart',
	'ex-step-curve-type-echarts-line-chart',
	'ex-stripped-variant-echarts-bar-chart',
	'ex-stripped-variant-echarts-composed-chart',
	'ex-svg-renderer-echarts-area-chart',
	'ex-svg-renderer-echarts-bar-chart',
	'ex-svg-renderer-echarts-composed-chart',
	'ex-svg-renderer-echarts-line-chart',
	'ex-svg-renderer-echarts-pie-chart',
	'ex-svg-renderer-echarts-radar-chart',
	'ex-svg-renderer-echarts-radial-chart',
	'ex-svg-renderer-echarts-sankey-chart',
	'ex-tooltip-default-echarts-bar-chart',
	'ex-tooltip-frosted-glass-echarts-bar-chart'
] as const;

const echartsExamples: RegistryItem[] = echartsExampleNames.map((name) => {
	const family = ['area', 'line', 'bar', 'composed', 'pie', 'radar', 'radial', 'sankey'].find(
		(candidate) => name.endsWith(`-${candidate}-chart`)
	);
	if (!family) throw new Error(`Unable to resolve the ECharts family for "${name}".`);
	return {
		name,
		dependencies:
			name === 'ex-chart-config-icons-echarts-bar-chart' ? ['@lucide/svelte'] : undefined,
		registryDependencies: [`@evilcharts/echarts-${family}-chart`],
		type: 'registry:block',
		files: [{ path: `examples/echarts/${name}.svelte`, type: 'registry:block' }]
	};
});

export const examples: RegistryItem[] = [...layerchartExamples, ...echartsExamples];
