import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Harness from './chart-accessibility.test.svelte';

const FAMILIES = ['area', 'line', 'bar', 'composed', 'pie', 'radar', 'radial', 'sankey'] as const;
const SERIES_CONTROL_FAMILIES = ['area', 'line', 'bar', 'radar'] as const;
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

	it.each(SERIES_CONTROL_FAMILIES)(
		'selects a clickable %s series from the keyboard control without a legend',
		async (family) => {
			const { container } = render(Harness, { family, seriesOnly: true });
			const controls = container.querySelector('[aria-label="Selectable chart series"]');

			await expect.poll(() => controls?.querySelectorAll('button').length).toBe(2);
			const desktop = [...(controls?.querySelectorAll('button') ?? [])].find(
				(button) => button.textContent?.trim() === 'Desktop'
			) as HTMLButtonElement | undefined;
			expect(desktop).toBeTruthy();
			desktop?.focus();
			await userEvent.keyboard('{Enter}');

			await expect.poll(() => desktop?.getAttribute('aria-pressed')).toBe('true');
			await expect
				.poll(() => container.querySelector('[data-test="selection"]')?.textContent)
				.toBe('desktop');
		}
	);

	it.each(SERIES_CONTROL_FAMILIES)(
		'does not duplicate the clickable %s legend with hidden series controls',
		(family) => {
			const { container } = render(Harness, { family });
			expect(container.querySelector('[aria-label="Selectable chart series"]')).toBeNull();
		}
	);
});
