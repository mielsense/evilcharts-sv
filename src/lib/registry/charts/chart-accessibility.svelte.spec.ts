import { render } from 'vitest-browser-svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Harness from './chart-accessibility.test.svelte';

const FAMILIES = ['area', 'line', 'bar', 'composed', 'pie', 'radar', 'radial', 'sankey'] as const;
const NativeResizeObserver = window.ResizeObserver;

class StaticResizeObserver implements ResizeObserver {
	disconnect() {}
	observe() {}
	unobserve() {}
}

describe('chart accessibility contract', () => {
	beforeEach(() => {
		window.ResizeObserver = StaticResizeObserver;
	});

	afterEach(() => {
		window.ResizeObserver = NativeResizeObserver;
	});

	it.each(FAMILIES)(
		'names and describes the interactive %s chart without hiding controls',
		async (family) => {
			const { container } = render(Harness, { family });
			const group = container.querySelector<HTMLElement>('[data-chart]');

			expect(group).not.toBeNull();
			expect(group?.getAttribute('role')).toBe('group');
			expect(group?.getAttribute('role')).not.toBe('img');
			expect(group?.getAttribute('aria-label')).toBe(`${family} chart`);

			const descriptionId = group?.getAttribute('aria-describedby');
			expect(descriptionId).toBeTruthy();
			expect(container.querySelector(`#${descriptionId}`)?.textContent).toBe(
				`${family} chart description`
			);

			await expect
				.poll(
					() => group?.querySelectorAll(family === 'sankey' ? '[role="button"]' : 'button').length
				)
				.toBeGreaterThan(0);
		}
	);

	it('supports external accessible names and descriptions', () => {
		const { container } = render(Harness, { family: 'area', external: true });
		const group = container.querySelector<HTMLElement>('[data-chart]');

		expect(group?.getAttribute('aria-label')).toBeNull();
		expect(group?.getAttribute('aria-labelledby')).toBe('external-chart-title');
		expect(group?.getAttribute('aria-describedby')).toBe('external-chart-description');
		expect(container.querySelector('#external-chart-title')?.textContent).toBe(
			'Externally named area chart'
		);
		expect(container.querySelector('#external-chart-description')?.textContent).toBe(
			'Externally described area chart'
		);
	});
});
