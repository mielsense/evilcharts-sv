import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import Harness from './harness.spec.svelte';
import type { ChartConfig } from '../layerchart-chart/chart-config.js';
import type { ChartLegendVariant, LegendPayloadItem } from './types.js';

const config: ChartConfig = {
	desktop: { label: 'Desktop', colors: { light: ['#047857'], dark: ['#10b981'] } },
	mobile: { label: 'Mobile', colors: { light: ['#be123c', '#f43f5e'], dark: ['#f43f5e'] } }
};

const payload: LegendPayloadItem[] = [{ dataKey: 'desktop' }, { dataKey: 'mobile' }];

function legend(container: Element) {
	return container.querySelector<HTMLElement>('.select-none');
}

function entries(container: Element) {
	return legend(container)!.children;
}

describe('ChartLegendContent', () => {
	it('renders nothing without a payload', () => {
		const { container } = render(Harness, { config, payload: [] });
		expect(legend(container)).toBeNull();
	});

	it('renders one entry per item, labelled from the config', () => {
		const { container } = render(Harness, { config, payload });
		expect(entries(container).length).toBe(2);
		expect(legend(container)!.textContent).toContain('Desktop');
		expect(legend(container)!.textContent).toContain('Mobile');
	});

	it('skips entries typed as none', () => {
		const { container } = render(Harness, {
			config,
			payload: [...payload, { dataKey: 'ghost', type: 'none' }]
		});
		expect(entries(container).length).toBe(2);
	});

	it('aligns per the align prop', () => {
		for (const [align, expected] of [
			['left', 'justify-start'],
			['center', 'justify-center'],
			['right', 'justify-end']
		] as const) {
			const { container } = render(Harness, { config, payload, align });
			expect(legend(container)!.className).toContain(expected);
		}
	});

	it('pads below when placed on top, above otherwise', () => {
		const top = render(Harness, { config, payload, verticalAlign: 'top' });
		expect(legend(top.container)!.className).toContain('pb-4');
		const bottom = render(Harness, { config, payload, verticalAlign: 'bottom' });
		expect(legend(bottom.container)!.className).toContain('pt-4');
	});

	it('dims entries that are not the selected series', () => {
		const { container } = render(Harness, { config, payload, selected: 'desktop' });
		const [first, second] = entries(container);
		expect(first.className).not.toContain('opacity-30');
		expect(second.className).toContain('opacity-30');
	});

	it('renders a non-interactive element unless isClickable', () => {
		const { container } = render(Harness, { config, payload });
		expect(entries(container)[0].tagName).toBe('DIV');
		expect(entries(container)[0].className).not.toContain('cursor-pointer');
	});

	it('toggles selection on click when isClickable', () => {
		const onSelectChange = vi.fn();
		const { container } = render(Harness, { config, payload, isClickable: true, onSelectChange });
		const [first] = entries(container);
		expect(first.tagName).toBe('BUTTON');
		expect(first.className).toContain('cursor-pointer');
		(first as HTMLButtonElement).click();
		expect(onSelectChange).toHaveBeenCalledWith('desktop');
	});

	it('clears the selection when the selected entry is clicked again', () => {
		const onSelectChange = vi.fn();
		const { container } = render(Harness, {
			config,
			payload,
			isClickable: true,
			selected: 'desktop',
			onSelectChange
		});
		(entries(container)[0] as HTMLButtonElement).click();
		expect(onSelectChange).toHaveBeenCalledWith(null);
	});

	const variantGeometry: Record<ChartLegendVariant, string> = {
		square: 'h-2 w-2',
		circle: 'rounded-full',
		'circle-outline': 'h-2.5 w-2.5',
		'rounded-square': 'rounded-[2px]',
		'rounded-square-outline': 'rounded-[3px]',
		'vertical-bar': 'h-3 w-1',
		'horizontal-bar': 'h-1 w-3'
	};

	it('gives each variant its own indicator geometry', () => {
		for (const [variant, expected] of Object.entries(variantGeometry)) {
			const { container } = render(Harness, {
				config,
				payload,
				variant: variant as ChartLegendVariant
			});
			expect(entries(container)[0].firstElementChild!.className).toContain(expected);
		}
	});

	it('uses mask-composite for outline variants and a plain background otherwise', () => {
		const outline = render(Harness, { config, payload, variant: 'circle-outline' });
		const style = outline.container
			.querySelector('.select-none')!
			.firstElementChild!.firstElementChild!.getAttribute('style')!;
		// The browser folds `mask-composite` into the `mask` shorthand, exactly as it does for
		// the reference's inline style object.
		expect(style).toContain('content-box exclude');
		expect(style).toContain('var(--color-desktop-0)');

		const filled = render(Harness, { config, payload, variant: 'circle' });
		const filledStyle = filled.container
			.querySelector('.select-none')!
			.firstElementChild!.firstElementChild!.getAttribute('style')!;
		expect(filledStyle).not.toContain('exclude');
	});

	it('renders a gradient indicator for multi-color series', () => {
		const { container } = render(Harness, { config, payload });
		const style = entries(container)[1].firstElementChild!.getAttribute('style')!;
		expect(style).toContain('linear-gradient(to right, var(--color-mobile-0) 0%');
		expect(style).toContain('var(--color-mobile-1) 100%');
	});
});
