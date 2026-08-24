import { expect, test, type Page } from '@playwright/test';

const BLOCKS = [
	'b-grid-bar-chart',
	'b-hover-trace-bar-chart',
	'b-isometric-bar-chart',
	'b-monospace-bar-chart'
] as const;

function collectErrors(page: Page) {
	const errors: string[] = [];
	page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
	page.on('pageerror', (e) => errors.push(String(e)));
	return errors;
}

function plot(page: Page) {
	return page.locator('svg.lc-layout-svg').first();
}

async function open(page: Page, name: string) {
	const errors = collectErrors(page);
	await page.goto(`/preview/${name}`);
	await page.waitForSelector('[data-preview-ready]');
	await page.waitForTimeout(1800); // let the staggered intro finish
	return errors;
}

test.describe('EvilCharts blocks', () => {
	for (const name of BLOCKS) {
		test(`${name} renders cleanly`, async ({ page }) => {
			const errors = await open(page, name);

			const svg = plot(page);
			await expect(svg).toBeVisible();
			expect(Number(await svg.getAttribute('width'))).toBeGreaterThan(300);
			// Every block draws its own shapes, so assert on painted geometry rather than `.lc-bar`.
			expect(
				await svg.locator('rect, polygon, path').count(),
				'the block painted nothing'
			).toBeGreaterThan(3);

			expect(errors).toEqual([]);
		});
	}

	test('the isometric block matches the reference geometry', async ({ page }) => {
		await open(page, 'b-isometric-bar-chart');

		// Measured on the running reference at the same card size: `barCategoryGap="25%"` over a
		// 7-band plot gives a 40px front face, and `margin.top=30` + the 30px XAxis put the baseline
		// 175px below the plot top. See plans/DEVIATIONS.md BL-2.
		const front = await plot(page)
			.locator('rect')
			.evaluateAll((nodes) =>
				nodes
					.map((n) => ({
						x: Number(n.getAttribute('x')),
						y: Number(n.getAttribute('y')),
						w: Number(n.getAttribute('width')),
						h: Number(n.getAttribute('height'))
					}))
					.filter((r) => r.w === 40)
			);
		expect(front.length).toBeGreaterThanOrEqual(7);
		expect(front[0].y + front[0].h).toBeCloseTo(175, 0);
		expect(front[0].h).toBeCloseTo(85.96, 1);

		// Three faces per column: front rect, top bevel, side bevel.
		await expect(plot(page).locator('polygon')).toHaveCount(14);
	});

	test('the isometric block reports the hovered month', async ({ page }) => {
		await open(page, 'b-isometric-bar-chart');

		for (const [tick, expected] of [
			['Jan', 'January'],
			['May', 'May'],
			['Jul', 'July']
		] as const) {
			const label = page
				.locator('.lc-axis-tick-label', { hasText: new RegExp(`^${tick}$`) })
				.first();
			const box = (await label.boundingBox())!;
			const area = (await plot(page).boundingBox())!;
			await page.mouse.move(box.x + box.width / 2, area.y + area.height * 0.7);
			await expect(page.locator('.min-w-32').first()).toContainText(expected);
		}
		// `$47K`, not `47` — the block passes a custom formatter.
		await expect(page.locator('.min-w-32').first()).toContainText('$38K');
	});
});
