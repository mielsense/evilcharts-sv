import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import Harness from './harness.spec.svelte';
import type { ChartConfig } from '../layerchart-chart/chart-config.js';
import type { TooltipPayloadItem } from './types.js';

const config: ChartConfig = {
	desktop: { label: 'Desktop', colors: { light: ['#047857'], dark: ['#10b981'] } },
	mobile: {
		label: 'Mobile',
		colors: { light: ['#be123c', '#f43f5e', '#fda4af'], dark: ['#f43f5e'] }
	},
	January: { label: 'January' }
};

const payload: TooltipPayloadItem[] = [
	{ dataKey: 'desktop', name: 'desktop', value: 1234, payload: { month: 'January' } },
	{ dataKey: 'mobile', name: 'mobile', value: 567, payload: { month: 'January' } }
];

function tip(container: Element) {
	return container.querySelector<HTMLElement>('.min-w-32');
}

/** The rows container is the tooltip root's `<div class="grid gap-1.5">` child. */
function rows(container: Element) {
	return tip(container)!.querySelectorAll<HTMLElement>(':scope > div.grid > div');
}

describe('ChartTooltipContent', () => {
	it('renders a bare spacer when inactive, so the tooltip never animates from 0,0', () => {
		const { container } = render(Harness, { config, active: false, payload });
		expect(tip(container)).toBeNull();
		expect(container.querySelector('span.p-4')).not.toBeNull();
	});

	it('renders a bare spacer when the payload is empty', () => {
		const { container } = render(Harness, { config, active: true, payload: [] });
		expect(container.querySelector('span.p-4')).not.toBeNull();
	});

	it('renders one row per payload item with config labels and localized values', () => {
		const { container } = render(Harness, { config, active: true, payload });
		const root = tip(container)!;
		expect(root.textContent).toContain('Desktop');
		expect(root.textContent).toContain('Mobile');
		expect(root.textContent).toContain((1234).toLocaleString());
		expect(root.textContent).toContain((567).toLocaleString());
	});

	it('resolves the label through the config when `label` is a configured string', () => {
		const { container } = render(Harness, { config, active: true, payload, label: 'January' });
		expect(tip(container)!.querySelector(':scope > .font-medium')!.textContent!.trim()).toBe(
			'January'
		);
	});

	it('hides the label with hideLabel', () => {
		const { container } = render(Harness, {
			config,
			active: true,
			payload,
			label: 'January',
			hideLabel: true
		});
		expect(tip(container)!.querySelector(':scope > .font-medium')).toBeNull();
	});

	it('skips rows typed as none', () => {
		const { container } = render(Harness, {
			config,
			active: true,
			payload: [...payload, { dataKey: 'ghost', name: 'ghost', value: 1, type: 'none' }]
		});
		expect(rows(container).length).toBe(2);
	});

	it('uses a solid background for single-color series and a gradient for multi-color', () => {
		const { container } = render(Harness, { config, active: true, payload });
		const indicators = tip(container)!.querySelectorAll<HTMLElement>('[style*="background"]');
		expect(indicators[0].getAttribute('style')).toContain('var(--color-desktop-0)');
		const mobile = indicators[1].getAttribute('style')!;
		expect(mobile).toContain('linear-gradient(to right,');
		expect(mobile).toContain('var(--color-mobile-0) 0%');
		expect(mobile).toContain('var(--color-mobile-1) 50%');
		expect(mobile).toContain('var(--color-mobile-2) 100%');
	});

	it('dims rows that are not the selected series', () => {
		const { container } = render(Harness, { config, active: true, payload, selected: 'desktop' });
		const [first, second] = rows(container);
		expect(first.className).not.toContain('opacity-30');
		expect(second.className).toContain('opacity-30');
	});

	it('sizes the indicator per variant', () => {
		for (const [indicator, expected] of [
			['dot', 'h-2.5 w-2.5'],
			['line', 'w-1'],
			['dashed', 'border-dashed']
		] as const) {
			const { container } = render(Harness, { config, active: true, payload, indicator });
			expect(tip(container)!.querySelector('[style*="background"]')!.className).toContain(expected);
		}
	});

	it('applies roundness and variant classes', () => {
		const { container } = render(Harness, {
			config,
			active: true,
			payload,
			roundness: 'sm',
			variant: 'frosted-glass'
		});
		const root = tip(container)!;
		expect(root.className).toContain('rounded-sm');
		expect(root.className).toContain('bg-background/70');
		expect(root.className).toContain('backdrop-blur-sm');
	});

	it('hides the indicator with hideIndicator', () => {
		const { container } = render(Harness, {
			config,
			active: true,
			payload,
			hideIndicator: true
		});
		expect(tip(container)!.querySelector('[style*="background"]')).toBeNull();
	});

	it('nests the label into the row for a single non-dot payload', () => {
		const { container } = render(Harness, {
			config,
			active: true,
			payload: [payload[0]],
			label: 'January',
			indicator: 'line'
		});
		const root = tip(container)!;
		// The label lives inside the row, not as the tooltip's first child.
		expect(root.firstElementChild!.className).toContain('grid gap-1.5');
		expect(root.querySelector('.items-end')).not.toBeNull();
	});
});
