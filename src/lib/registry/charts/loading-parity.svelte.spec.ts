import { render } from 'vitest-browser-svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Harness from './loading-parity.test.svelte';

const FAMILIES = ['area', 'line', 'bar', 'composed', 'pie', 'radar', 'radial', 'sankey'] as const;
type Family = (typeof FAMILIES)[number];
const NativeResizeObserver = window.ResizeObserver;

class StaticResizeObserver implements ResizeObserver {
	disconnect() {}
	observe() {}
	unobserve() {}
}

describe('chart loading parity', () => {
	let warnSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		// The chart roots intentionally support an initial dimension before live measurement. Pinning
		// that path makes this state-transition test deterministic and avoids Chromium's observer-loop
		// diagnostic while the loading skeleton and legend exchange space in a 320px fixture.
		window.ResizeObserver = StaticResizeObserver;
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		warnSpy.mockRestore();
		window.ResizeObserver = NativeResizeObserver;
	});

	function loadingMarks(container: HTMLElement, family: Family) {
		if (family === 'radar') {
			return container.querySelectorAll('path.lc-path[stroke="currentColor"]').length;
		}
		if (family === 'radial') {
			return container.querySelectorAll('path.lc-arc-line[fill="currentColor"]').length;
		}
		if (family === 'sankey') {
			return container.querySelectorAll('svg[viewBox="0 0 500 250"]').length;
		}
		return 0;
	}

	function loadedControls(container: HTMLElement, family: Family) {
		if (family === 'sankey') return container.querySelectorAll('[role="button"]').length;
		return container.querySelectorAll('.select-none > button').length;
	}

	async function samplePathFrames(container: HTMLElement, selector: string, duration = 2100) {
		const frames = new Set<string>();
		const startedAt = performance.now();

		while (performance.now() - startedAt < duration) {
			const path = container.querySelector<SVGPathElement>(selector);
			const pathData = path?.getAttribute('d');
			if (pathData) frames.add(pathData);
			await new Promise((resolve) => setTimeout(resolve, 50));
		}

		return frames;
	}

	it('keeps area geometry static while radial loading geometry interpolates', async () => {
		const area = render(Harness, { family: 'area' });
		const radial = render(Harness, { family: 'radial' });

		await expect
			.poll(() => area.container.querySelector('.lc-area-path')?.getAttribute('d'))
			.toBeTruthy();
		await expect
			.poll(() =>
				radial.container.querySelector('path.lc-arc-line[fill="currentColor"]')?.getAttribute('d')
			)
			.toBeTruthy();
		const areaPath = area.container.querySelector<SVGPathElement>('.lc-area-path');
		const shimmer = area.container.querySelector<SVGRectElement>(
			'pattern[id$="-loading-pattern"] > rect'
		);
		expect(areaPath).not.toBeNull();
		expect(shimmer).not.toBeNull();

		// Synchronize with the shimmer's left buffer. The loading data is allowed to refresh only
		// after the mask has crossed x=1 and fully left the visible plot, exactly like upstream.
		await expect
			.poll(() => {
				const x = Number(shimmer?.getAttribute('x'));
				return x >= -0.95 && x <= -0.5;
			})
			.toBe(true);
		const initialAreaPath = areaPath?.getAttribute('d');

		const [areaFrames, radialFrames] = await Promise.all([
			samplePathFrames(area.container, '.lc-area-path', 700),
			samplePathFrames(radial.container, 'path.lc-arc-line[fill="currentColor"]', 700)
		]);

		// The area silhouette stays fixed for the visible sweep while the radial sectors continuously
		// tween their angles.
		expect(areaFrames.size).toBe(1);
		expect(radialFrames.size).toBeGreaterThan(3);

		await expect.poll(() => Number(shimmer?.getAttribute('x'))).toBeGreaterThanOrEqual(1);
		await expect.poll(() => areaPath?.getAttribute('d')).not.toBe(initialAreaPath);
	}, 6000);

	it.each(FAMILIES)(
		'replaces the %s loading skeleton with live controls without remounting the chart root',
		async (family) => {
			const { container } = render(Harness, { family });
			const root = container.querySelector('[data-chart]');
			expect(container.querySelector('.select-none')).toBeNull();
			if (family === 'radar' || family === 'radial' || family === 'sankey') {
				expect(loadingMarks(container, family)).toBeGreaterThan(0);
			}

			(container.querySelector('[data-load]') as HTMLButtonElement).click();

			await expect.poll(() => loadedControls(container, family)).toBe(2);
			if (family === 'radar' || family === 'radial' || family === 'sankey') {
				await expect.poll(() => loadingMarks(container, family)).toBe(0);
			}
			expect(container.querySelector('[data-chart]')).toBe(root);

			// Let the intro finish before Vitest tears the chart tree down. This keeps the test from
			// manufacturing an interrupted transition that the runtime warning matrix treats as a defect.
			await new Promise((resolve) => setTimeout(resolve, 2500));
			expect(warnSpy).not.toHaveBeenCalled();
		}
	);
});
