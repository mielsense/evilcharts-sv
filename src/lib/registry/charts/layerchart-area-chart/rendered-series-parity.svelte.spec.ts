import { render } from 'vitest-browser-svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Harness from './rendered-series-parity.test.svelte';

const NativeResizeObserver = window.ResizeObserver;

class StaticResizeObserver implements ResizeObserver {
	disconnect() {}
	observe() {}
	unobserve() {}
}

describe('Area and Line rendered-series parity', () => {
	beforeEach(() => {
		window.ResizeObserver = StaticResizeObserver;
	});

	afterEach(() => {
		window.ResizeObserver = NativeResizeObserver;
	});

	for (const family of ['area', 'line'] as const) {
		it(`${family} ignores config-only series and includes mark-only series`, async () => {
			const { container } = render(Harness);
			const chart = container.querySelector(`[data-test="${family}"]`)!;
			const chartId = chart.querySelector<HTMLElement>('[data-chart]')!.dataset.chart!;
			const tooltip = () =>
				document.querySelector<HTMLElement>(
					`body > .lc-tooltip-root[data-chart="${chartId}"] .min-w-32`
				);

			await expect.poll(() => chart.querySelector('.select-none')?.children.length ?? 0).toBe(2);
			const legendText = chart.querySelector('.select-none')?.textContent ?? '';
			expect(legendText).toContain('Desktop');
			expect(legendText).not.toContain('Phantom');

			const markSelector =
				family === 'area' ? 'path.lc-area-path' : 'path.lc-path:not([stroke="transparent"])';
			await expect.poll(() => chart.querySelectorAll(markSelector).length).toBe(2);
			const marks = chart.querySelectorAll<SVGGraphicsElement>(markSelector);
			// A 10,000-valued phantom series would flatten these 1→20 marks below one pixel.
			expect(marks[0].getBBox().height).toBeGreaterThan(100);

			await expect.poll(() => tooltip()?.textContent ?? '').toContain('Desktop');
			const tooltipText = tooltip()?.textContent ?? '';
			expect(tooltipText).toContain('January');
			expect(tooltipText).toContain('mobile');
			expect(tooltipText).not.toContain('Phantom');
		});
	}
});
