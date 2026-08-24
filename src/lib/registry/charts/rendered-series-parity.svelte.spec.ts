import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import Harness from './rendered-series-parity.test.svelte';

describe('rendered series parity', () => {
	for (const family of ['bar', 'composed', 'radar'] as const) {
		it(`${family} derives its legend and value domain from rendered marks`, async () => {
			const { container } = render(Harness, { family });
			const chart = container.querySelector(`[data-test="${family}"]`)!;

			await expect
				.poll(() => chart.querySelector('.select-none')?.textContent)
				.toContain('Desktop');
			expect(chart.querySelector('.select-none')?.textContent).not.toContain('Phantom');
			if (family === 'composed') {
				expect(chart.querySelector('.select-none')?.textContent).toContain('Mobile');
			} else {
				expect(chart.querySelector('.select-none')?.textContent).not.toContain('Mobile');
			}

			const painted = chart.querySelector<SVGGraphicsElement>(
				family === 'radar' ? 'path[stroke^="url(#"]' : '.lc-bar:not([fill="transparent"])'
			);
			await expect.poll(() => painted?.getBBox().height ?? 0).toBeGreaterThan(20);
		});
	}
});
