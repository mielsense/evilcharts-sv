import { render } from 'vitest-browser-svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import LatencyAreaChart from './b-latency-area-chart.svelte';
import MarketSharePieChart from './b-market-share-pie-chart.svelte';

const NativeResizeObserver = window.ResizeObserver;

class StaticResizeObserver implements ResizeObserver {
	disconnect() {}
	observe() {}
	unobserve() {}
}

describe('LayerChart block live selection', () => {
	beforeEach(() => {
		window.ResizeObserver = StaticResizeObserver;
	});

	afterEach(() => {
		window.ResizeObserver = NativeResizeObserver;
	});

	it('keeps the latency chart root while an external metric selection updates its areas', async () => {
		const { container } = render(LatencyAreaChart);
		const root = container.querySelector('[data-chart]');
		expect(root).not.toBeNull();

		[...container.querySelectorAll<HTMLButtonElement>('section > div:first-child button')]
			.find((button) => button.textContent?.includes('P95'))!
			.click();

		await expect
			.poll(
				() =>
					[...container.querySelectorAll('.lc-area-path')].filter(
						(path) => path.getAttribute('fill-opacity') === '0.1'
					).length
			)
			.toBe(3);
		expect(container.querySelector('[data-chart]')).toBe(root);
	});

	it('keeps the market-share chart root while an external sector selection updates its pie', async () => {
		const { container } = render(MarketSharePieChart);
		const root = container.querySelector('[data-chart]');
		expect(root).not.toBeNull();

		[...container.querySelectorAll<HTMLButtonElement>('button')]
			.find((button) => button.textContent?.includes('Skyline'))!
			.click();

		await expect
			.poll(() =>
				container.querySelector('.lc-pie-arc[aria-label^="skyline:"]')?.getAttribute('aria-pressed')
			)
			.toBe('true');
		expect(container.querySelector('[data-chart]')).toBe(root);
	});
});
