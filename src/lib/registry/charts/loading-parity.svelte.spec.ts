import { render } from 'vitest-browser-svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Harness from './loading-parity.test.svelte';

const FAMILIES = ['area', 'line', 'bar', 'composed', 'pie'] as const;
const NativeResizeObserver = window.ResizeObserver;

class StaticResizeObserver implements ResizeObserver {
	disconnect() {}
	observe() {}
	unobserve() {}
}

describe('chart loading parity', () => {
	beforeEach(() => {
		// The chart roots intentionally support an initial dimension before live measurement. Pinning
		// that path makes this state-transition test deterministic and avoids Chromium's observer-loop
		// diagnostic while the loading skeleton and legend exchange space in a 320px fixture.
		window.ResizeObserver = StaticResizeObserver;
	});

	afterEach(() => {
		window.ResizeObserver = NativeResizeObserver;
	});

	it.each(FAMILIES)(
		'hides the %s legend while loading and restores it without remounting the chart root',
		async (family) => {
			const { container } = render(Harness, { family });
			const root = container.querySelector('[data-chart]');
			expect(container.querySelector('.select-none')).toBeNull();

			(container.querySelector('[data-load]') as HTMLButtonElement).click();

			await expect.poll(() => container.querySelectorAll('.select-none > button').length).toBe(2);
			expect(container.querySelector('[data-chart]')).toBe(root);

			// Let the intro finish before Vitest tears the chart tree down. This keeps the test from
			// manufacturing an interrupted transition that the runtime warning matrix treats as a defect.
			await new Promise((resolve) => setTimeout(resolve, 2500));
		}
	);
});
