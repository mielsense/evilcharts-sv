import { render } from 'vitest-browser-svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Harness from './controlled-selection.test.svelte';

const NativeResizeObserver = window.ResizeObserver;

class StaticResizeObserver implements ResizeObserver {
	disconnect() {}
	observe() {}
	unobserve() {}
}

function chartControl(container: HTMLElement, label: string) {
	return [
		...container.querySelectorAll<HTMLButtonElement>(
			'[aria-label="Selectable chart series"] button'
		)
	].find((button) => button.textContent?.trim() === label)!;
}

describe('LayerChart Area controlled selection', () => {
	beforeEach(() => {
		window.ResizeObserver = StaticResizeObserver;
	});

	afterEach(() => {
		window.ResizeObserver = NativeResizeObserver;
	});

	it('updates a controlled selection without replacing the chart root', async () => {
		const { container } = render(Harness);
		const root = container.querySelector('[data-chart]');
		expect(root).not.toBeNull();
		expect(chartControl(container, 'Mobile').getAttribute('aria-pressed')).toBe('true');

		container.querySelector<HTMLButtonElement>('[data-select="desktop"]')!.click();

		await expect
			.poll(() => chartControl(container, 'Desktop').getAttribute('aria-pressed'))
			.toBe('true');
		expect(chartControl(container, 'Mobile').getAttribute('aria-pressed')).toBe('false');
		expect(container.querySelector('[data-chart]')).toBe(root);

		container.querySelector<HTMLButtonElement>('[data-select="none"]')!.click();
		await expect
			.poll(() => chartControl(container, 'Desktop').getAttribute('aria-pressed'))
			.toBe('false');
		expect(chartControl(container, 'Mobile').getAttribute('aria-pressed')).toBe('false');
		expect(container.querySelector('[data-chart]')).toBe(root);
	});

	it('reports a controlled request without mutating the effective selection', async () => {
		const { container } = render(Harness);
		chartControl(container, 'Desktop').click();

		await expect
			.poll(() => container.querySelector('[data-callback]')?.textContent)
			.toBe('desktop');
		expect(chartControl(container, 'Mobile').getAttribute('aria-pressed')).toBe('true');
		expect(chartControl(container, 'Desktop').getAttribute('aria-pressed')).toBe('false');
	});

	it('initializes an uncontrolled chart from its default and then owns selection', async () => {
		const { container } = render(Harness, { controlled: false });
		expect(chartControl(container, 'Mobile').getAttribute('aria-pressed')).toBe('true');

		chartControl(container, 'Desktop').click();

		await expect
			.poll(() => chartControl(container, 'Desktop').getAttribute('aria-pressed'))
			.toBe('true');
		expect(container.querySelector('[data-callback]')?.textContent).toBe('desktop');
	});
});
