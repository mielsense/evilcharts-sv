import { expect, test, type Locator } from '@playwright/test';

async function tokenColors(locator: Locator) {
	return locator
		.locator('span[style]')
		.evaluateAll((spans) => [...new Set(spans.map((span) => getComputedStyle(span).color))]);
}

async function expectDecorativeHugeicon(svg: Locator) {
	await expect(svg).toHaveAttribute('aria-hidden', 'true');
	await expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
	await expect(svg).toHaveAttribute('color', 'currentColor');
	await expect.poll(() => svg.locator('path').count()).toBeGreaterThan(0);

	const geometry = await svg.evaluate((element) => ({
		width: Number(element.getAttribute('width')),
		height: Number(element.getAttribute('height')),
		hasPathGeometry: [...element.querySelectorAll('path')].every((path) =>
			Boolean(path.getAttribute('d')?.trim())
		)
	}));
	expect(geometry.width).toBeGreaterThan(0);
	expect(geometry.height).toBeGreaterThan(0);
	expect(geometry.hasPathGeometry).toBe(true);
}

test('markdown fences and chart source tabs use syntax token colors', async ({ page }) => {
	await page.goto('/docs/layerchart/area-chart');

	const markdownFence = page.locator('pre.shiki').first();
	await expect(markdownFence).toBeVisible();
	expect((await tokenColors(markdownFence)).length).toBeGreaterThan(2);

	await page.getByRole('tab', { name: 'Code' }).first().click();
	const chartSource = page.locator('[data-rehype-pretty-code-figure] pre.shiki').first();
	await expect(chartSource).toBeVisible();
	expect((await tokenColors(chartSource)).length).toBeGreaterThan(2);
});

test('client navigation swaps the selected compiled docs page without reloading', async ({
	page
}) => {
	await page.addInitScript(() => {
		(window as Window & { __docsLoads?: number }).__docsLoads =
			((window as Window & { __docsLoads?: number }).__docsLoads ?? 0) + 1;
	});
	await page.goto('/docs/layerchart/area-chart');
	await expect(page.getByRole('heading', { level: 1, name: 'Area Chart' })).toBeVisible();

	await page.getByRole('link', { name: /^Line Chart Beautifully designed Svelte 5/ }).click();

	await expect(page).toHaveURL(/\/docs\/layerchart\/line-chart$/);
	await expect(page.getByRole('heading', { level: 1, name: 'Line Chart' })).toBeVisible();
	await expect(page.getByText(/^The line chart is composable\./)).toBeVisible();
	await expect(
		page.evaluate(() => (window as Window & { __docsLoads?: number }).__docsLoads)
	).resolves.toBe(1);
});

test('unknown docs routes keep the docs shell and offer a useful recovery path', async ({
	page
}) => {
	const response = await page.goto('/docs/not-a-real-page');

	expect(response?.status()).toBe(404);
	await expect(page).toHaveTitle(`404 — Evil Charts`);
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
	await expect(
		page.getByRole('heading', { level: 1, name: 'This docs page doesn’t exist.' })
	).toBeVisible();
	await expect(page.getByRole('link', { name: 'Browse documentation' })).toHaveAttribute(
		'href',
		'/docs'
	);
	await expect(page.getByRole('link', { name: 'EvilCharts docs home' })).toBeVisible();
});

test('the introduction uses the Svelte accent and padded credits', async ({ page }) => {
	await page.goto('/docs');

	const portNotice = page.locator('[data-slot="alert-description"]').first();
	await expect(portNotice.locator(':scope > p')).toHaveCount(1);
	await expect(portNotice).toContainText(
		'This is a Svelte 5 port of EvilCharts with ordered-dither chart variants adapted from Dither Kit.'
	);
	for (const name of ['EvilCharts', 'Dither Kit']) {
		const link = portNotice.getByRole('link', { name });
		await expect(link).toHaveClass(/text-svelte/);
		await expect(link).toHaveCSS('text-decoration-line', 'underline');
	}

	const accentLink = page.getByRole('link', { name: 'LayerChart' }).first();
	await expect(accentLink).toHaveClass(/text-svelte/);

	const inlineCode = page.getByText('Svelte 5', { exact: true });
	await expect(inlineCode).toHaveCSS('font-family', /JetBrains Mono/);

	const credits = page.locator('table').filter({ hasText: 'Original project' }).locator('..');
	await expect(credits).toHaveCSS('padding-top', '8px');
	await expect(credits.getByRole('link', { name: 'LayerChart' })).toHaveAttribute(
		'href',
		'https://www.layerchart.com/'
	);
	await expect(credits.getByRole('link', { name: 'Apache ECharts' })).toHaveAttribute(
		'href',
		'https://echarts.apache.org/'
	);
	await expect(page.getByRole('heading', { name: 'Which provider?' })).toBeVisible();
	await expect(page.getByText(/mix both providers/)).toBeVisible();
});

test('the provider switcher uses the LayerChart mark at desktop and mobile widths', async ({
	page
}) => {
	await page.addInitScript(() => localStorage.removeItem('evilcharts-provider'));

	for (const width of [1280, 390]) {
		await page.setViewportSize({ width, height: 800 });
		await page.goto('/docs');

		if (width < 640) {
			const sidebarTrigger = page.getByRole('button', { name: 'Toggle Sidebar' });
			await expect(async () => {
				if (!(await page.getByRole('button', { name: /LayerChart/ }).isVisible())) {
					await sidebarTrigger.click();
				}
				await expect(page.getByRole('button', { name: /LayerChart/ })).toBeVisible();
			}).toPass();
		}

		const trigger = page.getByRole('button', { name: /LayerChart/ });
		await expect(trigger.locator('svg[data-icon="layerchart"]')).toBeVisible();
		await expect(async () => {
			if ((await trigger.getAttribute('aria-expanded')) !== 'true') await trigger.click();
			await expect(trigger).toHaveAttribute('aria-expanded', 'true');
		}).toPass();

		const layerChartChoice = page.getByRole('menuitem', { name: /LayerChart/ });
		await expect(layerChartChoice.locator('svg[data-icon="layerchart"]')).toBeVisible();
		const choices = page.getByRole('menuitem');
		await expect(choices).toHaveCount(2);
		await expect(choices.nth(0)).toContainText('LayerChart');
		await expect(choices.nth(1)).toContainText('ECharts');
		await page.getByRole('menuitem', { name: /ECharts/ }).click();
		await expect(page).toHaveURL(/\/docs\/?$/);
		await expect(page.getByRole('button', { name: /ECharts/ })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Default', exact: true }).first()).toHaveAttribute(
			'href',
			'/docs/echarts/area-chart'
		);
	}
});

test('standard controls render decorative Hugeicons and preserve their actions', async ({
	page
}) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');

	const browseCharts = page.getByRole('link', { name: 'Browse Charts', exact: true });
	await expectDecorativeHugeicon(browseCharts.locator('svg'));
	await browseCharts.click();
	await expect(page).toHaveURL(/\/docs\/?$/);

	await page.goto('/docs/layerchart/area-chart');

	const reloadPreview = page.getByRole('button', { name: 'Reload preview', exact: true }).first();
	const reloadIcon = reloadPreview.locator('svg');
	await expectDecorativeHugeicon(reloadIcon);
	await expect(reloadIcon).toHaveAttribute('style', /rotate\(0deg\)/);
	await reloadPreview.click();
	await expect(reloadIcon).toHaveAttribute('style', /rotate\(360deg\)/);

	const copyDisclosure = page.getByRole('button', { name: 'Open dropdown menu', exact: true });
	await expectDecorativeHugeicon(copyDisclosure.locator('svg'));
	await copyDisclosure.click();
	await expect(page.getByRole('menuitem', { name: 'View as Markdown' })).toBeVisible();
	await page.keyboard.press('Escape');

	const areaDisclosure = page.getByRole('button', { name: 'Area Chart', exact: true });
	const areaDisclosureIcon = areaDisclosure.locator('svg').last();
	await expectDecorativeHugeicon(areaDisclosureIcon);
	await expect(areaDisclosure).toHaveAttribute('aria-expanded', 'true');
	await expect
		.poll(() => areaDisclosureIcon.evaluate((icon) => getComputedStyle(icon).rotate))
		.toBe('90deg');
	await areaDisclosure.click();
	await expect(areaDisclosure).toHaveAttribute('aria-expanded', 'false');
	await expect
		.poll(() => areaDisclosureIcon.evaluate((icon) => getComputedStyle(icon).rotate))
		.toBe('none');
	await areaDisclosure.click();
	await expect(areaDisclosure).toHaveAttribute('aria-expanded', 'true');
	await expect
		.poll(() => areaDisclosureIcon.evaluate((icon) => getComputedStyle(icon).rotate))
		.toBe('90deg');

	const tocLabel = page.getByText('On This Page', { exact: true });
	const toc = tocLabel.locator('../..');
	await expectDecorativeHugeicon(tocLabel.locator('..').locator('svg'));
	await toc.getByRole('link', { name: 'Installation', exact: true }).click();
	await expect(page).toHaveURL(/#installation$/);

	const providerDisclosure = page.getByRole('button', { name: /^LayerChart/ });
	await expectDecorativeHugeicon(providerDisclosure.locator('svg').last());
	await providerDisclosure.click();
	await page.getByRole('menuitem', { name: /ECharts/ }).click();
	await expect(page).toHaveURL(/\/docs\/echarts\/area-chart$/);

	await page.goto('/docs/layerchart/area-chart');
	const previous = page.getByRole('link', { name: /^Components Every EvilCharts component\./ });
	const next = page.getByRole('link', { name: /^Line Chart Beautifully designed Svelte 5/ });
	await expectDecorativeHugeicon(previous.locator('svg'));
	await expectDecorativeHugeicon(next.locator('svg'));
	await previous.click();
	await expect(page).toHaveURL(/\/docs\/layerchart\/components$/);

	await page.goto('/docs/layerchart/area-chart');
	await page.getByRole('link', { name: /^Line Chart Beautifully designed Svelte 5/ }).click();
	await expect(page).toHaveURL(/\/docs\/layerchart\/line-chart$/);

	await page.setViewportSize({ width: 390, height: 800 });
	await page.goto('/docs/layerchart/area-chart');
	await page.getByRole('button', { name: 'Toggle Sidebar' }).click();
	const sidebarDialog = page.getByRole('dialog');
	await expect(sidebarDialog).toBeVisible();
	// The mobile sidebar deliberately hides this built-in close control in favor of its header toggle.
	const sheetClose = page.getByRole('button', { name: 'Close', includeHidden: true });
	await expectDecorativeHugeicon(sheetClose.locator('svg'));
	await sheetClose.evaluate((button: HTMLButtonElement) => button.click());
	await expect(sidebarDialog).toBeHidden();
});
