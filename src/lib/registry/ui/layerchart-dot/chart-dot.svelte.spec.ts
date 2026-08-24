import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import Harness from './harness.spec.svelte';
import type { DotVariant } from './types.js';

const base = { cx: 50, cy: 40, dataKey: 'desktop', chartId: 'chart-x' };

function svg(container: Element) {
	return container.querySelector<SVGSVGElement>('[data-testid="host"]')!;
}

describe('ChartDot', () => {
	it('renders nothing without coordinates', () => {
		const { container } = render(Harness, { ...base, cx: undefined, cy: undefined });
		expect(svg(container).querySelector('g')).toBeNull();
	});

	it('points the fill at the chart-scoped gradient', () => {
		const { container } = render(Harness, base);
		expect(svg(container).querySelector('rect')!.getAttribute('fill')).toBe(
			'url(#chart-x-colors-desktop)'
		);
	});

	const geometry: Record<DotVariant, { r: number; circles: number; clips: number }> = {
		// r=3, one clipped full-width gradient rect, no solid circle
		default: { r: 3, circles: 1, clips: 1 },
		// r=6 with a 5px background ring plus an inner clip
		border: { r: 6, circles: 3, clips: 2 },
		// r=3 with a 1px gradient ring and a solid inner circle
		'colored-border': { r: 3.5, circles: 2, clips: 1 }
	};

	it('gives each variant its documented geometry', () => {
		for (const [type, expected] of Object.entries(geometry)) {
			const { container } = render(Harness, { ...base, type: type as DotVariant });
			const root = svg(container);
			expect(root.querySelectorAll('clipPath').length).toBe(expected.clips);
			expect(root.querySelectorAll('circle').length).toBe(expected.circles);
			expect(Number(root.querySelector('clipPath circle')!.getAttribute('r'))).toBe(expected.r);
		}
	});

	it('spans the full chart width so the gradient is chart-relative', () => {
		const { container } = render(Harness, base);
		expect(svg(container).querySelector('rect')!.getAttribute('width')).toBe('100%');
	});

	it('applies the reveal mask when given one', () => {
		const { container } = render(Harness, { ...base, maskId: 'reveal-1' });
		expect(svg(container).querySelector('g')!.getAttribute('mask')).toBe('url(#reveal-1)');
	});

	it('omits the mask attribute when there is no mask', () => {
		const { container } = render(Harness, base);
		expect(svg(container).querySelector('g')!.hasAttribute('mask')).toBe(false);
	});

	it('honours fillOpacity', () => {
		const { container } = render(Harness, { ...base, fillOpacity: 0.4 });
		expect(svg(container).querySelector('rect')!.getAttribute('fill-opacity')).toBe('0.4');
	});

	it('scopes clip ids per instance', () => {
		const a = render(Harness, base);
		const b = render(Harness, base);
		const idA = a.container.querySelector('clipPath')!.id;
		const idB = b.container.querySelector('clipPath')!.id;
		expect(idA).not.toBe(idB);
	});

	it('tints the border variants with the background color', () => {
		for (const type of ['border', 'colored-border'] as const) {
			const { container } = render(Harness, { ...base, type });
			expect(svg(container).querySelector('g')!.getAttribute('class')).toContain('text-background');
		}
	});
});
