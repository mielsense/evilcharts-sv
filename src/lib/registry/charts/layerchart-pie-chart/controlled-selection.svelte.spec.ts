import { render } from 'vitest-browser-svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { tick } from 'svelte';
import Harness from './controlled-selection.test.svelte';

const NativeResizeObserver = window.ResizeObserver;

class StaticResizeObserver implements ResizeObserver {
	disconnect() {}
	observe() {}
	unobserve() {}
}

function sector(container: HTMLElement, name: string) {
	return container.querySelector<SVGPathElement>(`.lc-pie-arc[aria-label^="${name}:"]`)!;
}

function clickSector(container: HTMLElement, name: string) {
	sector(container, name).dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

describe('LayerChart Pie controlled selection', () => {
	beforeEach(() => {
		window.ResizeObserver = StaticResizeObserver;
	});

	afterEach(() => {
		window.ResizeObserver = NativeResizeObserver;
	});

	it('updates and clears a controlled selection without replacing the chart root', async () => {
		const { container } = render(Harness);
		const root = container.querySelector('[data-chart]');
		expect(root).not.toBeNull();
		await expect.poll(() => sector(container, 'safari')?.getAttribute('aria-pressed')).toBe('true');

		container.querySelector<HTMLButtonElement>('[data-select="chrome"]')!.click();

		await expect.poll(() => sector(container, 'chrome')?.getAttribute('aria-pressed')).toBe('true');
		expect(sector(container, 'safari').getAttribute('opacity')).toBe('0.15');
		expect(container.querySelector('[data-chart]')).toBe(root);

		container.querySelector<HTMLButtonElement>('[data-select="none"]')!.click();
		await expect
			.poll(() => sector(container, 'chrome')?.getAttribute('aria-pressed'))
			.toBe('false');
		expect(sector(container, 'chrome').getAttribute('opacity')).toBe('1');
		expect(sector(container, 'safari').getAttribute('opacity')).toBe('1');
		expect(container.querySelector('[data-chart]')).toBe(root);
	});

	it('reports a controlled request without mutating the effective selection', async () => {
		const { container } = render(Harness);
		await expect.poll(() => sector(container, 'chrome')).not.toBeNull();
		clickSector(container, 'chrome');

		await expect.poll(() => container.querySelector('[data-callback]')?.textContent).toBe('chrome');
		expect(sector(container, 'safari').getAttribute('aria-pressed')).toBe('true');
		expect(sector(container, 'chrome').getAttribute('aria-pressed')).toBe('false');
	});

	it('initializes an uncontrolled chart once and ignores later default changes', async () => {
		const { container } = render(Harness, { controlled: false });
		await expect.poll(() => sector(container, 'safari')?.getAttribute('aria-pressed')).toBe('true');

		container.querySelector<HTMLButtonElement>('[data-default="chrome"]')!.click();
		await tick();
		expect(sector(container, 'safari').getAttribute('aria-pressed')).toBe('true');
		expect(sector(container, 'chrome').getAttribute('aria-pressed')).toBe('false');

		clickSector(container, 'chrome');

		await expect.poll(() => sector(container, 'chrome').getAttribute('aria-pressed')).toBe('true');
		expect(container.querySelector('[data-callback]')?.textContent).toBe('chrome');
	});
});
