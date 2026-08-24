import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import ChartContainer from './chart-container.svelte';
import type { ChartConfig } from './chart-config.js';

const config: ChartConfig = {
	desktop: { label: 'Desktop', colors: { light: ['#047857'], dark: ['#10b981'] } },
	mobile: { label: 'Mobile', colors: { light: ['#be123c', '#f43f5e'], dark: ['#f43f5e'] } }
};

function containerOf(el: Element) {
	return el.querySelector<HTMLElement>('[data-slot="chart"]')!;
}

describe('ChartContainer', () => {
	it('marks the chart slot and derives a selector-safe data-chart id', () => {
		const { container } = render(ChartContainer, { config });
		const root = containerOf(container);
		expect(root).toBeTruthy();
		expect(root.dataset.chart).toMatch(/^chart-[\w-]+$/);
		expect(root.dataset.chart).not.toContain(':');
	});

	it('honours an explicit id', () => {
		const { container } = render(ChartContainer, { config, id: 'demo' });
		expect(containerOf(container).dataset.chart).toBe('chart-demo');
	});

	it('applies aspect-video only when there is no footer', () => {
		const { container } = render(ChartContainer, { config });
		expect(containerOf(container).className).toContain('aspect-video');
	});

	it('emits one --color-<key>-<index> declaration per distributed slot, per theme', () => {
		const { container } = render(ChartContainer, { config, id: 'vars' });
		const css = container.querySelector('style')!.textContent!;

		// `mobile` has two light colors and one dark color, so both themes fill two slots.
		expect(css).toContain(' [data-chart=chart-vars] {');
		expect(css).toContain('.dark [data-chart=chart-vars] {');
		expect(css).toContain('--color-desktop-0: #047857;');
		expect(css).toContain('--color-mobile-0: #be123c;');
		expect(css).toContain('--color-mobile-1: #f43f5e;');
		expect(css).toContain('--color-desktop-0: #10b981;');
		// The single dark `mobile` color is distributed across both slots.
		expect(css.match(/--color-mobile-\d: #f43f5e;/g)!.length).toBe(3);
	});

	it('renders no style element when no entry declares colors', () => {
		const { container } = render(ChartContainer, { config: { desktop: { label: 'Desktop' } } });
		expect(container.querySelector('style')).toBeNull();
	});

	it('throws the reference message for an invalid colors object', () => {
		expect(() =>
			render(ChartContainer, { config: { desktop: { colors: {} } } as unknown as ChartConfig })
		).toThrow(/must have at least one theme key \(light, dark\)/);
	});
});
