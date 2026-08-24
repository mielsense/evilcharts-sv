import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import Harness from './harness.spec.svelte';
import { PATTERN_MAP } from './pattern-map.js';
import type { BackgroundVariant } from './types.js';

const VARIANTS = Object.keys(PATTERN_MAP) as BackgroundVariant[];

/** Tile size each variant's <pattern> declares in the reference. */
const TILE: Record<BackgroundVariant, [string, string]> = {
	dots: ['20', '20'],
	grid: ['20', '20'],
	'cross-hatch': ['20', '20'],
	'diagonal-lines': ['6', '6'],
	plus: ['16', '16'],
	'falling-triangles': ['18', '36'],
	'4-pointed-star': ['16', '16'],
	'tiny-checkers': ['8', '8'],
	'overlapping-circles': ['40', '40'],
	'wiggle-lines': ['52', '26'],
	bubbles: ['100', '100']
};

function svg(container: Element) {
	return container.querySelector<SVGSVGElement>('[data-testid="host"]')!;
}

describe('ChartBackground', () => {
	it('covers all eleven reference variants', () => {
		expect(VARIANTS.length).toBe(11);
	});

	it('renders each variant with its reference tile size', () => {
		for (const variant of VARIANTS) {
			const { container } = render(Harness, { variant });
			const pattern = svg(container).querySelector('pattern')!;
			expect([pattern.getAttribute('width'), pattern.getAttribute('height')]).toEqual(
				TILE[variant]
			);
			expect(pattern.getAttribute('patternUnits')).toBe('userSpaceOnUse');
		}
	});

	it('names the pattern id after the variant', () => {
		for (const variant of VARIANTS) {
			const { container } = render(Harness, { variant });
			expect(svg(container).querySelector('pattern')!.id).toContain(`-bg-${variant}`);
		}
	});

	it('paints a full-bleed rect through the pattern and the edge-fade mask', () => {
		const { container } = render(Harness, { variant: 'dots' });
		const rect = svg(container).querySelector(':scope > rect')!;
		expect(rect.getAttribute('width')).toBe('100%');
		expect(rect.getAttribute('height')).toBe('100%');
		expect(rect.getAttribute('fill')).toBe(`url(#${svg(container).querySelector('pattern')!.id})`);
		expect(rect.getAttribute('mask')).toContain('-bg-edge-fade');
	});

	it('blurs an inset white rect to build the edge fade', () => {
		const { container } = render(Harness, { variant: 'dots' });
		const root = svg(container);
		expect(root.querySelector('feGaussianBlur')!.getAttribute('stdDeviation')).toBe('25');
		const maskRect = root.querySelector('mask rect')!;
		expect([
			maskRect.getAttribute('x'),
			maskRect.getAttribute('y'),
			maskRect.getAttribute('width'),
			maskRect.getAttribute('height')
		]).toEqual(['8%', '20%', '85%', '60%']);
		expect(root.querySelector('mask')!.getAttribute('maskUnits')).toBe('userSpaceOnUse');
	});

	it('scopes ids per instance so two backgrounds never collide', () => {
		const { container } = render(Harness, { variant: 'dots', twice: true });
		const ids = [...svg(container).querySelectorAll('pattern, mask, filter')].map((n) => n.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('uses the border color token for every pattern', () => {
		for (const variant of VARIANTS) {
			const { container } = render(Harness, { variant });
			const mark = svg(container).querySelector('pattern > *')!;
			expect(mark.getAttribute('class')).toContain('text-border');
		}
	});
});
