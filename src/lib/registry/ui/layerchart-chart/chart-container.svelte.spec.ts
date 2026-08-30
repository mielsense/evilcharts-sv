import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import ChartContainer from './chart-container.svelte';
import type { ChartConfig } from './chart-config.js';
import DimensionHarness from './chart-container-dimension.spec.svelte';

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

	it('uses the theme-aware muted foreground token for axis ticks', () => {
		const { container } = render(ChartContainer, { config });
		const className = containerOf(container).className;
		expect(className).toContain('[&_.lc-axis-tick-label]:fill-muted-foreground');
		expect(className).not.toContain('[&_.lc-axis-tick-label]:fill-[#666]');
	});

	it('emits one --color-<key>-<index> declaration per distributed slot, per theme', () => {
		const { container } = render(ChartContainer, { config, id: 'vars' });
		const css = container.querySelector('style')!.textContent!;

		// `mobile` has two light colors and one dark color, so both themes fill two slots.
		expect(css).toContain(' [data-chart="chart-vars"] {');
		expect(css).toContain('.dark [data-chart="chart-vars"] {');
		expect(css).toContain('--color-desktop-0: #047857;');
		expect(css).toContain('--color-mobile-0: #be123c;');
		expect(css).toContain('--color-mobile-1: #f43f5e;');
		expect(css).toContain('--color-desktop-0: #10b981;');
		// The single dark `mobile` color is distributed across both slots.
		expect(css.match(/--color-mobile-\d: #f43f5e;/g)!.length).toBe(3);
	});

	it('encodes arbitrary config keys and quotes explicit ids in generated CSS', () => {
		const unsafeConfig = {
			'Total Sales': { colors: { light: ['#ff3e00'], dark: ['#ff3e00'] } }
		} satisfies ChartConfig;
		const { container } = render(ChartContainer, {
			config: unsafeConfig,
			id: 'sales"]{}'
		});
		const css = container.querySelector('style')!.textContent!;

		expect(css).toContain('[data-chart="chart-sales\\"]{}"]');
		expect(css).toContain(
			'--color-u-00005400006f00007400006100006c00002000005300006100006c000065000073-0'
		);
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

	it('uses initialDimension at zero size, then yields to a real container measurement', async () => {
		const { container } = render(DimensionHarness);
		const output = container.querySelector('output')!;
		await expect.poll(() => output.textContent).toBe('640x360');

		container.querySelector('button')!.click();
		await expect
			.poll(() => container.querySelector<HTMLElement>('[data-test="dimension-host"]')!.offsetWidth)
			.toBe(480);
		await expect.poll(() => output.textContent).toBe('480x240');
	});
});
