import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import Harness from './dither-canvas.spec.svelte';

function state(container: Element): string {
	return container.querySelector<HTMLOutputElement>('[data-testid="paint-state"]')!.value;
}

function paintCount(container: Element): number {
	return Number(state(container).split('|')[0]);
}

describe('DitherCanvas', () => {
	it('measures its host, resolves scoped theme colors, and paints a crisp backing store', async () => {
		const { container } = render(Harness);
		const canvas = container.querySelector<HTMLCanvasElement>('[data-slot="dither-canvas"]')!;

		await expect.poll(() => canvas.width).toBe(128);
		expect(canvas.height).toBe(64);
		await expect.poll(() => state(container)).toContain('rgb(255 62 0)');
		const pixel = canvas.getContext('2d')!.getImageData(1, 1, 1, 1).data;
		expect([...pixel]).toEqual([255, 62, 0, 255]);
	});

	it('repaints for selection, hover, theme, and size changes', async () => {
		const { container } = render(Harness);
		const canvas = container.querySelector<HTMLCanvasElement>('[data-slot="dither-canvas"]')!;
		await expect.poll(() => paintCount(container)).toBeGreaterThan(0);

		container.querySelector<HTMLButtonElement>('[data-testid="selection"]')!.click();
		await expect.poll(() => state(container)).toContain('selection');
		container.querySelector<HTMLButtonElement>('[data-testid="hover"]')!.click();
		await expect.poll(() => state(container)).toContain('hover');

		const beforeTheme = paintCount(container);
		document.documentElement.classList.add('dither-test-theme');
		await expect.poll(() => paintCount(container)).toBeGreaterThan(beforeTheme);
		document.documentElement.classList.remove('dither-test-theme');

		container.querySelector<HTMLButtonElement>('[data-testid="resize"]')!.click();
		await expect.poll(() => canvas.width).toBe(192);
	});

	it('paints rect, polygon, polar arc, and pixel stroke geometry on the shared canvas', async () => {
		const { container } = render(Harness, { shapes: true });
		const canvas = container.querySelector<HTMLCanvasElement>('[data-slot="dither-canvas"]')!;
		await expect.poll(() => paintCount(container)).toBeGreaterThan(0);
		const context = canvas.getContext('2d')!;

		expect([...context.getImageData(4, 4, 1, 1).data]).toEqual([255, 0, 0, 255]);
		expect([...context.getImageData(34, 4, 1, 1).data]).toEqual([0, 255, 0, 255]);
		expect([...context.getImageData(80, 12, 1, 1).data]).toEqual([0, 0, 255, 255]);
		expect(context.getImageData(98, 12, 1, 1).data[3]).toBeGreaterThan(0);
	});

	it('stops requesting frames after a bounded entrance animation', async () => {
		const { container } = render(Harness, { animate: true, animationDuration: 32 });
		await expect.poll(() => state(container).split('|')[1]).toBe('1');
		await new Promise((resolve) => setTimeout(resolve, 40));
		const settledCount = paintCount(container);

		await new Promise((resolve) => setTimeout(resolve, 80));
		expect(paintCount(container)).toBe(settledCount);
	});

	it('collapses an entrance animation to one final frame for reduced motion', async () => {
		const { container } = render(Harness, {
			animate: true,
			animationDuration: 400,
			reducedMotion: true
		});

		await expect.poll(() => state(container).split('|')[1]).toBe('1');
		expect(state(container).split('|')[4]).toBe('1');
	});
});
