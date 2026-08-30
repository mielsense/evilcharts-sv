import { expect, test } from '@playwright/test';
import { waitForPreview } from '$site/testing/wait-for-preview.js';

test('client-side docs navigation resets the docs scroll container', async ({ page }) => {
	test.setTimeout(90_000);
	await page.goto('/docs/chart-config');
	await expect(page.getByRole('heading', { level: 1, name: 'Chart Config' })).toBeVisible();

	const scrollRoot = page.locator('[data-docs-scroll-root]');
	await expect
		.poll(() => scrollRoot.evaluate((element) => element.scrollHeight - element.clientHeight))
		.toBeGreaterThan(1000);
	await scrollRoot.evaluate((element) => element.scrollTo(0, element.scrollHeight));
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

test('the brush footer matches the original geometry at desktop and mobile widths', async ({
	page
}) => {
	const cases = [
		{
			url: '/preview/ex-area-chart?w=902&h=520',
			chartWidth: 900,
			chartHeight: 520,
			ticks: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			lastTickInset: 0
		},
		{
			url: '/preview/ex-area-chart?w=322&h=256',
			chartWidth: 320,
			chartHeight: 256,
			ticks: ['Feb', 'Apr', 'Jun', 'Aug', 'Oct', 'Dec'],
			lastTickInset: 0
		},
		{
			url: '/preview/ex-area-chart?w=350&h=256',
			chartWidth: 348,
			chartHeight: 256,
			ticks: ['Feb', 'Apr', 'Jun', 'Jul', 'Aug', 'Oct', 'Dec'],
			lastTickInset: 0
		},
		{
			url: '/preview/ex-line-chart?w=632&h=360',
			chartWidth: 630,
			chartHeight: 360,
			ticks: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			lastTickInset: 0
		},
		{
			url: '/preview/ex-bar-chart?w=632&h=360',
			chartWidth: 630,
			chartHeight: 360,
			ticks: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			lastTickInset: 18.24
		},
		{
			url: '/preview/ex-composed-chart?w=632&h=360',
			chartWidth: 630,
			chartHeight: 360,
			ticks: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			lastTickInset: 18.24
		}
	] as const;

	for (const current of cases) {
		await page.goto(current.url);
		await waitForPreview(page);

		const geometry = await page.locator('[data-slot="chart"]').evaluate((chart) => {
			const rect = (element: Element) => {
				const value = element.getBoundingClientRect();
				return {
					x: value.x,
					y: value.y,
					width: value.width,
					height: value.height,
					right: value.right,
					bottom: value.bottom
				};
			};
			const brush = chart.querySelector<HTMLElement>('[data-slot="brush"]')!;
			const selection = brush.querySelector<HTMLElement>('.cursor-grab')!;
			const handles = [...brush.querySelectorAll<HTMLElement>('.cursor-ew-resize')];
			const ticks = [
				...chart.querySelectorAll<SVGTextElement>(
					'.lc-axis[data-placement="bottom"] .lc-axis-tick-label'
				)
			];
			const mainSvg = [...chart.querySelectorAll<SVGSVGElement>('svg.lc-layout-svg')].find(
				(svg) => !brush.contains(svg)
			)!;
			const legend = chart.querySelector<HTMLElement>('.pointer-events-auto.absolute')!;
			const tokenProbe = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			tokenProbe.style.fill = 'var(--muted-foreground)';
			chart.append(tokenProbe);
			const mutedForeground = getComputedStyle(tokenProbe).fill;
			tokenProbe.remove();

			return {
				chart: rect(chart),
				mainSvg: rect(mainSvg),
				brush: rect(brush),
				selection: rect(selection),
				legend: rect(legend),
				mutedForeground,
				ticks: ticks.map((tick) => ({
					text: tick.textContent,
					rect: rect(tick),
					fill: getComputedStyle(tick).fill
				})),
				handles: handles.map((handle) => rect(handle)),
				pills: handles.map((handle) => rect(handle.firstElementChild!))
			};
		});

		expect(geometry.chart.width).toBe(current.chartWidth);
		expect(geometry.chart.height).toBe(current.chartHeight);
		expect(geometry.mainSvg.x - geometry.chart.x).toBe(16);
		expect(geometry.mainSvg.y - geometry.chart.y).toBe(16);
		expect(geometry.mainSvg.width).toBe(current.chartWidth - 32);
		expect(geometry.mainSvg.height).toBe(current.chartHeight - 92);

		expect(geometry.brush).toEqual({
			x: geometry.mainSvg.x,
			y: geometry.mainSvg.bottom + 4,
			width: geometry.mainSvg.width,
			height: 56,
			right: geometry.mainSvg.right,
			bottom: geometry.chart.bottom - 16
		});
		expect(geometry.selection).toEqual(geometry.brush);

		expect(geometry.legend.x - geometry.mainSvg.x).toBe(5);
		expect(geometry.legend.y - geometry.mainSvg.y).toBe(5);
		expect(geometry.legend.width).toBe(geometry.mainSvg.width - 10);
		expect(geometry.legend.height).toBe(32);

		expect(geometry.ticks.map((tick) => tick.text)).toEqual(current.ticks);
		expect(geometry.ticks.every((tick) => tick.fill === geometry.mutedForeground)).toBe(true);
		const tickBottom = Math.max(...geometry.ticks.map((tick) => tick.rect.bottom));
		expect(geometry.brush.y - tickBottom).toBeCloseTo(13.5, 1);
		expect(
			Math.abs(geometry.mainSvg.right - geometry.ticks.at(-1)!.rect.right - current.lastTickInset)
		).toBeLessThanOrEqual(0.5);
		expect(geometry.ticks.every((tick) => tick.rect.x >= geometry.mainSvg.x)).toBe(true);
		expect(geometry.ticks.every((tick) => tick.rect.right <= geometry.mainSvg.right)).toBe(true);

		for (const handle of geometry.handles) {
			expect(handle.width).toBe(12);
			expect(handle.height).toBe(56);
		}
		for (const pill of geometry.pills) {
			expect(pill.width).toBe(6);
			expect(pill.height).toBe(16);
			expect(pill.x).toBeGreaterThan(geometry.chart.x);
			expect(pill.right).toBeLessThan(geometry.chart.right);
		}
	}
});

test('the docs attribution header stays inside its responsive container', async ({ page }) => {
	await page.goto('/docs/chart-config');
	const header = page.locator('[data-sidebar="header"]').filter({ hasText: 'Based on EvilCharts' });
	const headerActions = header.locator(':scope > div').last();
	const decorativeBorder = page.locator('svg[viewBox="0 0 400 44"]');
	const attribution = header.getByRole('link', { name: 'Based on EvilCharts' });
	const author = header.getByRole('link', { name: 'Svelte port by miel' });
	const expectNotchBeforeActions = async () => {
		const [actionsBox, borderBox] = await Promise.all([
			headerActions.boundingBox(),
			decorativeBorder.boundingBox()
		]);
		expect(actionsBox).not.toBeNull();
		expect(borderBox).not.toBeNull();

		// The translated curve ends at x=56 in the SVG's 400-unit viewBox. Keep the filled header
		// surface clear of every control while its trailing edge masks the panel border.
		const curveEnd = borderBox!.x + borderBox!.width * (56 / 400);
		expect(curveEnd).toBeLessThanOrEqual(actionsBox!.x - 8);
	};

	for (const width of [640]) {
		await page.setViewportSize({ width, height: 800 });
		await expect(attribution).toBeHidden();
		await expect(author).toBeHidden();

		const [headerBox, actionsBox] = await Promise.all([
			header.boundingBox(),
			headerActions.boundingBox()
		]);
		expect(headerBox).not.toBeNull();
		expect(actionsBox).not.toBeNull();
		expect(actionsBox!.x).toBeGreaterThanOrEqual(headerBox!.x);
		expect(actionsBox!.x + actionsBox!.width).toBeLessThanOrEqual(headerBox!.x + headerBox!.width);
		await expectNotchBeforeActions();
		await expect
			.poll(() => page.evaluate(() => document.documentElement.scrollWidth))
			.toBeLessThanOrEqual(width);
	}

	for (const width of [768, 940, 996]) {
		await page.setViewportSize({ width, height: 800 });
		await expect(attribution).toBeHidden();
		await expect(author).toBeHidden();

		const [headerBox, actionsBox] = await Promise.all([
			header.boundingBox(),
			headerActions.boundingBox()
		]);
		expect(headerBox).not.toBeNull();
		expect(actionsBox).not.toBeNull();
		expect(actionsBox!.x).toBeGreaterThanOrEqual(headerBox!.x);
		expect(actionsBox!.x + actionsBox!.width).toBeLessThanOrEqual(headerBox!.x + headerBox!.width);
		await expectNotchBeforeActions();
		await expect
			.poll(() => page.evaluate(() => document.documentElement.scrollWidth))
			.toBeLessThanOrEqual(width);
	}

	for (const width of [1024]) {
		await page.setViewportSize({ width, height: 800 });
		await expect(attribution).toBeVisible();
		await expect(author).toBeHidden();

		const [headerBox, attributionBox, actionsBox] = await Promise.all([
			header.boundingBox(),
			attribution.boundingBox(),
			headerActions.boundingBox()
		]);
		expect(headerBox).not.toBeNull();
		expect(attributionBox).not.toBeNull();
		expect(actionsBox).not.toBeNull();
		expect(attributionBox!.x).toBeGreaterThanOrEqual(headerBox!.x);
		expect(attributionBox!.x + attributionBox!.width).toBeLessThanOrEqual(
			headerBox!.x + headerBox!.width
		);
		expect(actionsBox!.x + actionsBox!.width).toBeLessThanOrEqual(headerBox!.x + headerBox!.width);
		await expectNotchBeforeActions();
		await expect
			.poll(() => page.evaluate(() => document.documentElement.scrollWidth))
			.toBeLessThanOrEqual(width);
	}

	for (const width of [1280]) {
		await page.setViewportSize({ width, height: 800 });
		await expect(attribution).toBeVisible();
		await expect(author).toBeVisible();

		const [headerBox, attributionBox, actionsBox] = await Promise.all([
			header.boundingBox(),
			attribution.boundingBox(),
			headerActions.boundingBox()
		]);
		expect(headerBox).not.toBeNull();
		expect(attributionBox).not.toBeNull();
		expect(actionsBox).not.toBeNull();
		expect(attributionBox!.x).toBeGreaterThanOrEqual(headerBox!.x);
		expect(attributionBox!.x + attributionBox!.width).toBeLessThanOrEqual(
			headerBox!.x + headerBox!.width
		);
		expect(actionsBox!.x + actionsBox!.width).toBeLessThanOrEqual(headerBox!.x + headerBox!.width);
		expect(await attribution.evaluate((element) => element.scrollWidth)).toBe(
			await attribution.evaluate((element) => element.clientWidth)
		);
		await expectNotchBeforeActions();
		await expect
			.poll(() => page.evaluate(() => document.documentElement.scrollWidth))
			.toBeLessThanOrEqual(width);
	}

	await page.setViewportSize({ width: 320, height: 568 });
	await expect(attribution).toBeHidden();
	await expectNotchBeforeActions();
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
