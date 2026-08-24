import { expect, test } from '@playwright/test';

test('client-side docs navigation resets the docs scroll container', async ({ page }) => {
	test.setTimeout(90_000);
	await page.goto('/docs/chart-config');
	await expect(page.getByRole('heading', { level: 1, name: 'Chart Config' })).toBeVisible();

	const scrollRoot = page.locator('[data-docs-scroll-root]');
	await scrollRoot.evaluate((element) => element.scrollTo(0, 1800));
	await expect
		.poll(() => scrollRoot.evaluate((element) => element.scrollTop))
		.toBeGreaterThan(1000);

	await page.getByRole('link', { name: 'Installation', exact: true }).click();
	await expect(page).toHaveURL(/\/docs\/layerchart\/installation$/);
	await expect.poll(() => scrollRoot.evaluate((element) => element.scrollTop)).toBe(0);
});

test('the initial landing camera has chart cards above and below its focus', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');

	const stage = page.locator('main > div').filter({ has: page.locator('[data-stage-card]') });
	const focused = stage.locator('[data-stage-focused="true"]');
	const focusBox = await focused.boundingBox();
	expect(focusBox).not.toBeNull();

	const visibleCards = await stage.locator('[data-stage-card]').evaluateAll((elements) =>
		elements
			.map((element) => ({
				text: element.textContent ?? '',
				top: element.getBoundingClientRect().top,
				bottom: element.getBoundingClientRect().bottom
			}))
			.filter((card) => card.bottom > 0 && card.top < innerHeight)
	);

	expect(visibleCards.some((card) => card.bottom < focusBox!.y)).toBe(true);
	expect(visibleCards.some((card) => card.top > focusBox!.y + focusBox!.height)).toBe(true);
});

test('the chart axis clears the brush preview', async ({ page }) => {
	await page.goto('/preview/ex-brush-area-chart?w=900&h=520');
	await page.waitForSelector('[data-preview-ready]');

	const brushTop = await page
		.locator('[data-slot="brush"]')
		.evaluate((element) => element.getBoundingClientRect().top);
	const tickBottom = await page
		.locator('.lc-axis-tick-label')
		.evaluateAll((ticks) => Math.max(...ticks.map((tick) => tick.getBoundingClientRect().bottom)));

	expect(brushTop - tickBottom).toBeGreaterThanOrEqual(4);
});

test('the docs attribution header stays inside its responsive container', async ({ page }) => {
	await page.goto('/docs/chart-config');
	const header = page.locator('[data-sidebar="header"]').filter({ hasText: 'Based on EvilCharts' });
	const attribution = header.getByRole('link', { name: 'Based on EvilCharts' });

	for (const width of [768, 940, 1280]) {
		await page.setViewportSize({ width, height: 800 });
		await expect(attribution).toBeVisible();

		const [headerBox, attributionBox] = await Promise.all([
			header.boundingBox(),
			attribution.boundingBox()
		]);
		expect(headerBox).not.toBeNull();
		expect(attributionBox).not.toBeNull();
		expect(attributionBox!.x).toBeGreaterThanOrEqual(headerBox!.x);
		expect(attributionBox!.x + attributionBox!.width).toBeLessThanOrEqual(
			headerBox!.x + headerBox!.width
		);
		expect(await attribution.evaluate((element) => element.scrollWidth)).toBe(
			await attribution.evaluate((element) => element.clientWidth)
		);
	}

	await page.setViewportSize({ width: 320, height: 568 });
	await expect(attribution).toBeHidden();
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
