/**
 * The chart stage's layout and camera model.
 *
 * Ported from `evilcharts/src/components/landing/chart-stage.tsx`. Canvas size, hop distance,
 * focus interval, easing and the flight duration/zoom curves are the reference's values.
 *
 * The reference's grid interleaves 22 LayerChart-equivalent cards with 18 ECharts blocks. This port
 * ships one provider, so the ECharts slots are dropped and the remaining 22 are re-flowed into the
 * same five columns at the same pitch — same canvas, same flight lengths.
 */
import { cubicBezier } from '@humanspeak/svelte-motion';

export const CANVAS_W = 3480;
export const CANVAS_H = 2520;

/**
 * Every card keeps a fixed slot on the canvas — only the "camera" (the canvas transform) ever
 * moves, so focus changes read as pans, not reshuffles.
 */
export type StageCard = {
	id: string;
	title: string;
	x: number;
	y: number;
	w: number;
	h: number;
	/** Key into the card component map in `chart-stage.svelte`. */
	card: string;
};

// prettier-ignore
export const CARDS: StageCard[] = [
	{ id: 'radar',           title: 'radar-chart',            x: 60,   y: 40,   w: 470, h: 290, card: 'LandingRadarChart' },
	{ id: 'duotone-bar',     title: 'duotone-bar-chart',      x: 60,   y: 430,  w: 470, h: 290, card: 'LandingDuotoneBarChart' },
	{ id: 'gradient-bar',    title: 'gradient-bar-chart',     x: 60,   y: 820,  w: 470, h: 290, card: 'LandingGradientBarChart' },
	{ id: 'hatched-area',    title: 'hatched-area-chart',     x: 60,   y: 1210, w: 470, h: 290, card: 'LandingHatchedAreaChart' },
	{ id: 'stacked-bar',     title: 'stacked-bar-chart',      x: 60,   y: 1600, w: 480, h: 300, card: 'LandingStackedBarChart' },

	{ id: 'composed',        title: 'composed-chart',         x: 675,  y: 200,  w: 480, h: 300, card: 'LandingComposedChart' },
	{ id: 'glowing-line',    title: 'glowing-line-chart',     x: 675,  y: 600,  w: 470, h: 290, card: 'LandingGlowingLineChart' },
	{ id: 'dotted-area',     title: 'dotted-area-chart',      x: 675,  y: 990,  w: 470, h: 290, card: 'LandingDottedAreaChart' },
	{ id: 'bump-line',       title: 'bump-line-chart',        x: 675,  y: 1380, w: 470, h: 290, card: 'LandingBumpLineChart' },

	{ id: 'circle-radar',    title: 'circle-radar-chart',     x: 1290, y: 40,   w: 470, h: 290, card: 'LandingCircleRadarChart' },
	{ id: 'donut',           title: 'donut-pie-chart',        x: 1290, y: 440,  w: 470, h: 300, card: 'LandingDonutPieChart' },
	{ id: 'hatched-bar',     title: 'hatched-bar-chart',      x: 1290, y: 840,  w: 480, h: 300, card: 'LandingHatchedBarChart' },
	{ id: 'expanded-area',   title: 'expanded-area-chart',    x: 1290, y: 1230, w: 480, h: 300, card: 'LandingExpandedAreaChart' },

	{ id: 'gradient-area',   title: 'gradient-area-chart',    x: 1905, y: 200,  w: 480, h: 300, card: 'LandingGradientAreaChart' },
	{ id: 'semi-radial',     title: 'semi-radial-chart',      x: 1905, y: 600,  w: 480, h: 300, card: 'LandingSemiRadialChart' },
	{ id: 'dashed-line',     title: 'dashed-line-chart',      x: 1905, y: 1000, w: 470, h: 290, card: 'LandingDashedLineChart' },
	{ id: 'lines-area',      title: 'lines-area-chart',       x: 1905, y: 1390, w: 470, h: 290, card: 'LandingLinesAreaChart' },

	{ id: 'stripped-bar',    title: 'stripped-bar-chart',     x: 2520, y: 40,   w: 470, h: 290, card: 'LandingStrippedBarChart' },
	{ id: 'horizontal-bar',  title: 'horizontal-bar-chart',   x: 2520, y: 430,  w: 480, h: 300, card: 'LandingHorizontalBarChart' },
	{ id: 'lines-radar',     title: 'lines-radar-chart',      x: 2520, y: 830,  w: 470, h: 290, card: 'LandingLinesRadarChart' },
	{ id: 'step-line',       title: 'step-line-chart',        x: 2520, y: 1220, w: 470, h: 290, card: 'LandingStepLineChart' },
	{ id: 'padded-pie',      title: 'padded-pie-chart',       x: 2520, y: 1610, w: 470, h: 300, card: 'LandingPaddedPieChart' }
];

export const FOCUS_INTERVAL_MS = 4600;
/** A 3 x 3 neighbourhood covers the largest stage viewport without mounting all 22 charts. */
export const LIVE_CARD_LIMIT = 9;
export const START_INDEX = Math.max(
	0,
	CARDS.findIndex((card) => card.id === 'hatched-bar')
);
/**
 * Never hop to a card bordering the current one — a focus change should be a real flight (roughly
 * two column/row pitches away or more).
 */
export const MIN_HOP_DISTANCE = 1100;

export const hopDistance = (a: number, b: number) => {
	const ca = CARDS[a];
	const cb = CARDS[b];
	return Math.hypot(ca.x + ca.w / 2 - cb.x - cb.w / 2, ca.y + ca.h / 2 - cb.y - cb.h / 2);
};

export const clamp = (min: number, value: number, max: number) =>
	Math.min(max, Math.max(min, value));

/*
	── Camera model ────────────────────────────────────────────────────────────
	The camera is (lookAt, zoom): the canvas point under the viewport centre and the scale it renders
	at. Every frame derives the CSS transform from those two, so the look-at point travels a
	mathematically straight line while the zoom breathes — animating translate and scale as separate
	channels instead made the view veer sideways whenever the zoom dipped.

	GTA-character-switch profile: the look-at glides on one S-curve (slow, fast middle, slow) while
	the zoom follows a sin² bell — zero velocity at both ends, deepest exactly mid-flight.
*/
export const flightPanEase = cubicBezier(0.65, 0, 0.35, 1);
export const flightDurationFor = (distance: number) => clamp(1.35, 0.95 + distance / 1050, 2.7);
export const flightZoomOutFor = (distance: number) => clamp(0.68, 0.86 - distance * 0.00006, 0.86);

export function shuffled(length: number): number[] {
	const order = Array.from({ length }, (_, i) => i);
	for (let i = order.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[order[i], order[j]] = [order[j], order[i]];
	}
	return order;
}
