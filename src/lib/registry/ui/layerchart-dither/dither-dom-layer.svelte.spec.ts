import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import Harness from './dither-dom-layer.spec.svelte';

describe('DitherDomLayer', () => {
	it('maps transformed SVG paths into plot-local canvas coordinates', async () => {
		const { container } = render(Harness);
		const canvas = container.querySelector<HTMLCanvasElement>('[data-slot="dither-canvas"]')!;
		await expect
			.poll(() => {
				const cssWidth = canvas.parentElement?.getBoundingClientRect().width ?? 0;
				const pixelRatio = Math.min(window.devicePixelRatio, 2);
				return cssWidth > 0 && canvas.width === Math.floor(cssWidth * pixelRatio);
			})
			.toBe(true);

		const context = canvas.getContext('2d')!;
		await expect
			.poll(() =>
				[...context.getImageData(24, 16, 48, 40).data].some(
					(value, index) => index % 4 === 3 && value > 0
				)
			)
			.toBe(true);
		expect(context.getImageData(4, 4, 1, 1).data[3]).toBe(0);
		expect(context.getImageData(100, 70, 1, 1).data[3]).toBe(0);
	});

	it('keeps the transparent SVG mark authoritative for interaction', async () => {
		const { container } = render(Harness);
		const mark = container.querySelector<SVGPathElement>('[data-evil-dither-mark]')!;
		expect(mark.getAttribute('fill')).toBe('transparent');
		mark.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		await expect
			.poll(() => container.querySelector('[data-testid="clicked"]')?.textContent)
			.toBe('1');
	});
});
