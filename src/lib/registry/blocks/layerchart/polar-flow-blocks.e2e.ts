import { expect, test, type Page } from '@playwright/test';

const BLOCKS = [
	{ name: 'market-share-pie-chart', marker: 'Ecosystem value' },
	{ name: 'progress-rings-pie-chart', marker: '1,240 responses' },
	{ name: 'revenue-mix-pie-chart', marker: 'Total orders' },
	{ name: 'reliability-score-pie-chart', marker: 'Delivery Reliability' },
	{ name: 'capability-radar-chart', marker: 'Capability map' },
	{ name: 'budget-radial-chart', marker: 'Quarterly Spend' },
	{ name: 'ride-radial-chart', marker: 'km ridden' },
	{ name: 'cache-tiers-radial-chart', marker: 'Served Warm' },
	{ name: 'allocation-sankey-chart', marker: 'Where the fund flows' },
	{ name: 'pipeline-sankey-chart', marker: 'Total booked' }
] as const;

function collectErrors(page: Page) {
	const errors: string[] = [];
	page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
	page.on('pageerror', (error) => errors.push(String(error)));
	return errors;
}

test.describe('polar and flow blocks', () => {
	for (const { name, marker } of BLOCKS) {
		test(`${name} is a composed, contained registry block`, async ({ page }) => {
			const errors = collectErrors(page);
			await page.goto(`/preview/${name}?w=630&h=360`);
			await page.waitForSelector('[data-preview-ready]');
			await page.waitForTimeout(1700);

			await expect(page.getByText(marker, { exact: false }).first()).toBeVisible();
			const geometry = page.locator(
				'svg.lc-layout-svg path, svg.lc-layout-svg rect, svg.lc-layout-svg polygon'
			);
			expect(await geometry.count(), 'the block painted no chart geometry').toBeGreaterThan(2);

			const overflow = await page.locator('[data-slot="preview"]').evaluate((preview) => {
				const nested = [...preview.querySelectorAll<HTMLElement>('*')];
				return {
					horizontal: preview.scrollWidth - preview.clientWidth,
					vertical: preview.scrollHeight - preview.clientHeight,
					nestedScrollers: nested.filter((element) => {
						const style = getComputedStyle(element);
						return (
							/(auto|scroll)/.test(style.overflow + style.overflowX + style.overflowY) &&
							(element.scrollWidth > element.clientWidth + 1 ||
								element.scrollHeight > element.clientHeight + 1)
						);
					}).length
				};
			});
			expect(overflow.horizontal).toBeLessThanOrEqual(1);
			expect(overflow.vertical).toBeLessThanOrEqual(1);
			expect(overflow.nestedScrollers).toBe(0);
			expect(errors).toEqual([]);
		});
	}

	test('the composed blocks remain contained at phone width', async ({ page }) => {
		for (const { name } of BLOCKS) {
			await page.goto(`/preview/${name}?w=320&h=360`);
			await page.waitForSelector('[data-preview-ready]');
			const preview = page.locator('[data-slot="preview"]');
			const overflow = await preview.evaluate((element) => {
				const nested = [...element.querySelectorAll<HTMLElement>('*')];
				return {
					x: element.scrollWidth - element.clientWidth,
					y: element.scrollHeight - element.clientHeight,
					nestedScrollers: nested.filter((child) => {
						const style = getComputedStyle(child);
						return (
							/(auto|scroll)/.test(style.overflow + style.overflowX + style.overflowY) &&
							(child.scrollWidth > child.clientWidth + 1 ||
								child.scrollHeight > child.clientHeight + 1)
						);
					}).length
				};
			});
			expect(overflow.x, `${name} overflowed horizontally`).toBeLessThanOrEqual(1);
			expect(overflow.y, `${name} overflowed vertically`).toBeLessThanOrEqual(1);
			expect(overflow.nestedScrollers, `${name} created a nested scroller`).toBe(0);
		}
	});
});
