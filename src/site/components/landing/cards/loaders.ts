import type { Component } from 'svelte';

type LandingCard = Component<Record<string, never>>;
type LandingCardModule = { default: LandingCard };
type LandingCardLoader = () => Promise<LandingCardModule>;

const loaders: Record<string, LandingCardLoader> = {
	LandingRadarChart: () => import('./landing-radar-chart.svelte'),
	LandingComposedChart: () => import('./landing-composed-chart.svelte'),
	LandingGradientAreaChart: () => import('./landing-gradient-area-chart.svelte'),
	LandingHatchedBarChart: () => import('./landing-hatched-bar-chart.svelte'),
	LandingDuotoneBarChart: () => import('./landing-duotone-bar-chart.svelte'),
	LandingGradientBarChart: () => import('./landing-gradient-bar-chart.svelte'),
	LandingGlowingLineChart: () => import('./landing-glowing-line-chart.svelte'),
	LandingDashedLineChart: () => import('./landing-dashed-line-chart.svelte'),
	LandingDonutPieChart: () => import('./landing-donut-pie-chart.svelte'),
	LandingSemiRadialChart: () => import('./landing-semi-radial-chart.svelte'),
	LandingStrippedBarChart: () => import('./landing-stripped-bar-chart.svelte'),
	LandingStepLineChart: () => import('./landing-step-line-chart.svelte'),
	LandingDottedAreaChart: () => import('./landing-dotted-area-chart.svelte'),
	LandingCircleRadarChart: () => import('./landing-circle-radar-chart.svelte'),
	LandingHatchedAreaChart: () => import('./landing-hatched-area-chart.svelte'),
	LandingLinesAreaChart: () => import('./landing-lines-area-chart.svelte'),
	LandingExpandedAreaChart: () => import('./landing-expanded-area-chart.svelte'),
	LandingStackedBarChart: () => import('./landing-stacked-bar-chart.svelte'),
	LandingHorizontalBarChart: () => import('./landing-horizontal-bar-chart.svelte'),
	LandingBumpLineChart: () => import('./landing-bump-line-chart.svelte'),
	LandingLinesRadarChart: () => import('./landing-lines-radar-chart.svelte'),
	LandingPaddedPieChart: () => import('./landing-padded-pie-chart.svelte')
};

const moduleCache = new Map<string, Promise<LandingCard>>();

export function loadLandingCard(name: string): Promise<LandingCard> {
	const existing = moduleCache.get(name);
	if (existing) return existing;

	const loader = loaders[name];
	if (!loader) return Promise.reject(new Error(`Unknown landing card: ${name}`));

	const pending = loader()
		.then((module) => module.default)
		.catch((error) => {
			if (moduleCache.get(name) === pending) moduleCache.delete(name);
			throw error;
		});
	moduleCache.set(name, pending);
	return pending;
}
