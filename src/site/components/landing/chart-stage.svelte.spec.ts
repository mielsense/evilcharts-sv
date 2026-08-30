import { render } from 'vitest-browser-svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tick } from 'svelte';
import PreviewA from '$site/components/docs/charts/component-preview-a.fixture.svelte';
import ChartStage from './chart-stage.svelte';

const loadLandingCard = vi.hoisted(() => vi.fn());

vi.mock('$env/dynamic/public', () => ({ env: {} }));
vi.mock('./cards/loaders.js', () => ({ loadLandingCard }));
vi.mock('./chart-stage.svelte.js', async (importOriginal) => {
	const actual = await importOriginal<typeof import('./chart-stage.svelte.js')>();
	return {
		...actual,
		shuffled: (length: number) => [
			0,
			actual.START_INDEX,
			...Array.from({ length }, (_, index) => index).filter(
				(index) => index !== 0 && index !== actual.START_INDEX
			)
		]
	};
});
vi.mock('@humanspeak/svelte-motion', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@humanspeak/svelte-motion')>();
	return {
		...actual,
		animate: () => ({ stop() {} }),
		useReducedMotion: () => ({ current: false })
	};
});

const NativeResizeObserver = window.ResizeObserver;

class StaticResizeObserver implements ResizeObserver {
	disconnect() {}
	observe() {}
	unobserve() {}
}

async function flushLoads() {
	// Let the Svelte effect start the loaders, settle Promise.allSettled, then render the result.
	// A single timer flush can resume before that full microtask chain on slower CI runners.
	await tick();
	for (let pass = 0; pass < 2; pass += 1) {
		await vi.advanceTimersByTimeAsync(0);
		await Promise.resolve();
		await tick();
	}
}

beforeEach(() => {
	vi.useFakeTimers();
	window.ResizeObserver = StaticResizeObserver;
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1200);
	vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(900);
});

afterEach(() => {
	window.ResizeObserver = NativeResizeObserver;
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe('ChartStage lazy card loading', () => {
	it('keeps successful live cards when one wanted card rejects', async () => {
		loadLandingCard.mockImplementation((name: string) =>
			name === 'LandingHatchedBarChart'
				? Promise.reject(new Error('private landing chunk URL'))
				: Promise.resolve(PreviewA)
		);

		const { container } = render(ChartStage);
		await flushLoads();

		expect(
			container.querySelector('[data-stage-card="expanded-area"] [data-stage-live-chart]')
		).not.toBeNull();
		expect(
			container.querySelector('[data-stage-card="hatched-bar"] [data-stage-live-chart]')
		).toBeNull();
		expect(container.textContent).not.toContain('private landing chunk URL');
	});

	it('retries a failed card after it leaves and re-enters the wanted set', async () => {
		let failedOnce = false;
		loadLandingCard.mockImplementation((name: string) => {
			if (name === 'LandingHatchedBarChart' && !failedOnce) {
				failedOnce = true;
				return Promise.reject(new Error('private landing chunk URL'));
			}
			return Promise.resolve(PreviewA);
		});

		const { container } = render(ChartStage);
		await flushLoads();
		expect(
			container.querySelector('[data-stage-card="hatched-bar"] [data-stage-live-chart]')
		).toBeNull();

		await vi.advanceTimersByTimeAsync(4600);
		await tick();
		await vi.advanceTimersByTimeAsync(4600);
		await flushLoads();

		expect(
			container.querySelector('[data-stage-card="hatched-bar"] [data-stage-live-chart]')
		).not.toBeNull();
	});

	it('retains successful overlap when a newly wanted card fails', async () => {
		loadLandingCard.mockImplementation((name: string) =>
			name === 'LandingRadarChart'
				? Promise.reject(new Error('private new landing chunk URL'))
				: Promise.resolve(PreviewA)
		);

		const { container } = render(ChartStage);
		await flushLoads();
		expect(
			container.querySelector('[data-stage-card="glowing-line"] [data-stage-live-chart]')
		).not.toBeNull();

		await vi.advanceTimersByTimeAsync(4600);
		await flushLoads();

		expect(
			container.querySelector('[data-stage-card="glowing-line"] [data-stage-live-chart]')
		).not.toBeNull();
		expect(container.querySelector('[data-stage-card="radar"] [data-stage-live-chart]')).toBeNull();
	});
});
