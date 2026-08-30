import { expect, test, type Locator } from '@playwright/test';

async function tokenColors(locator: Locator) {
	return locator
		.locator('span[style]')
		.evaluateAll((spans) => [...new Set(spans.map((span) => getComputedStyle(span).color))]);
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
	}
});
