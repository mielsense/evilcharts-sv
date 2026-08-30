import { expect, test, type Page } from '@playwright/test';
import { waitForPreview } from '$site/testing/wait-for-preview.js';

const EXAMPLES = [
	'ex-dither-area-chart',
	'ex-dither-line-chart',
	'ex-dither-bar-chart',
	'ex-dither-composed-chart',
	'ex-dither-pie-chart',
	'ex-dither-radar-chart'
] as const;

function collectErrors(page: Page) {
	const errors: string[] = [];
	page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
	page.on('pageerror', (error) => errors.push(String(error)));
	return errors;
}

async function open(page: Page, name: (typeof EXAMPLES)[number], width = 630) {
	const errors = collectErrors(page);
	await page.goto(`/preview/${name}?w=${width}&h=360`);
	await waitForPreview(page);
	await page.waitForTimeout(1300);
	return errors;
}

test.describe('ordered-dither chart rendering', () => {
	for (const name of EXAMPLES) {
		test(`${name} paints one responsive canvas over transparent SVG targets`, async ({ page }) => {
			const errors = await open(page, name);
			const canvas = page.locator('canvas[data-slot="dither-canvas"]');
			await expect(canvas).toHaveCount(1);

			const state = await canvas.evaluate((node) => {
				const element = node as HTMLCanvasElement;
				const context = element.getContext('2d');
				const pixels = context?.getImageData(0, 0, element.width, element.height).data ?? [];
				let painted = 0;
				for (let index = 3; index < pixels.length; index += 4) {
					if (pixels[index] > 0) painted += 1;
				}
				return {
					painted,
					cssWidth: element.getBoundingClientRect().width,
					backingWidth: element.width,
					devicePixelRatio: window.devicePixelRatio
				};
			});
			expect(state.painted).toBeGreaterThan(20);
			expect(state.backingWidth).toBeCloseTo(state.cssWidth * state.devicePixelRatio, 0);

			const targets = page.locator('[data-evil-dither-mark]');
			await expect(targets.first()).toBeAttached();
			expect(await targets.count()).toBeGreaterThan(0);
			expect(errors).toEqual([]);
		});
	}
});
