import { render } from 'vitest-browser-svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tick } from 'svelte';
import PreviewA from '$site/components/docs/charts/component-preview-a.fixture.svelte';
import ChartStage from './chart-stage.svelte';
import { CARDS, loadLandingCardComponents } from './chart-stage.svelte.js';

const loadLandingCard = vi.hoisted(() => vi.fn());

vi.mock('$env/dynamic/public', () => ({ env: {} }));
vi.mock('./cards/loaders.js', () => ({ loadLandingCard }));

const NativeResizeObserver = window.ResizeObserver;
const NativeMatchMedia = window.matchMedia;

class StaticResizeObserver implements ResizeObserver {
	disconnect() {}
	observe() {}
	unobserve() {}
}

async function flushLoads() {
	// Let the Svelte effect start the loaders, settle Promise.allSettled, then render the result.
	// A single microtask can resume before that full chain on slower CI runners.
	await tick();
	for (let pass = 0; pass < 2; pass += 1) {
		await Promise.resolve();
		await tick();
	}
}

beforeEach(() => {
	window.ResizeObserver = StaticResizeObserver;
	window.matchMedia = vi.fn((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener() {},
		removeEventListener() {},
		addListener() {},
		removeListener() {},
		dispatchEvent: () => true
	}));
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1200);
	vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(900);
});

afterEach(() => {
	window.ResizeObserver = NativeResizeObserver;
	window.matchMedia = NativeMatchMedia;
	vi.restoreAllMocks();
});

describe('ChartStage lazy card loading', () => {
	it('keeps successful live cards when one wanted card rejects', async () => {
		loadLandingCard.mockImplementation((name: string) =>
			name === 'LandingHatchedBarChart'
				? Promise.reject(new Error('private landing chunk URL'))
				: Promise.resolve(PreviewA)
		);

		const { container } = await render(ChartStage);
		await flushLoads();

		expect(
			container.querySelector('[data-stage-card="expanded-area"] [data-stage-live-chart]')
		).not.toBeNull();
		expect(
			container.querySelector('[data-stage-card="hatched-bar"] [data-stage-live-chart]')
		).toBeNull();
		expect(container.textContent).not.toContain('private landing chunk URL');
	});

	it('retries a failed card when a later wanted set requests it again', async () => {
		let failedOnce = false;
		const loader = vi.fn((name: string) => {
			if (name === 'LandingHatchedBarChart' && !failedOnce) {
				failedOnce = true;
				return Promise.reject(new Error('private landing chunk URL'));
			}
			return Promise.resolve(PreviewA);
		});
		const hatchedBar = CARDS.findIndex((card) => card.id === 'hatched-bar');
		const radar = CARDS.findIndex((card) => card.id === 'radar');

		const failed = await loadLandingCardComponents([hatchedBar], loader);
		await loadLandingCardComponents([radar], loader);
		const retried = await loadLandingCardComponents([hatchedBar], loader);

		expect(failed.LandingHatchedBarChart).toBeUndefined();
		expect(retried.LandingHatchedBarChart).toBe(PreviewA);
		expect(loader).toHaveBeenCalledWith('LandingRadarChart');
	});

	it('retains successful overlap when a newly wanted card fails', async () => {
		const loader = vi.fn((name: string) =>
			name === 'LandingRadarChart'
				? Promise.reject(new Error('private new landing chunk URL'))
				: Promise.resolve(PreviewA)
		);
		const glowingLine = CARDS.findIndex((card) => card.id === 'glowing-line');
		const radar = CARDS.findIndex((card) => card.id === 'radar');

		const components = await loadLandingCardComponents([glowingLine, radar], loader);

		expect(components.LandingGlowingLineChart).toBe(PreviewA);
		expect(components.LandingRadarChart).toBeUndefined();
	});
});
