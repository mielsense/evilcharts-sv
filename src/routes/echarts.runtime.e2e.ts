import { expect, test, type Page } from '@playwright/test';

const NATIVE_EXAMPLES = [
	'ex-echarts-area-chart',
	'ex-echarts-line-chart',
	'ex-echarts-bar-chart',
	'ex-echarts-composed-chart',
	'ex-echarts-pie-chart',
	'ex-echarts-radar-chart',
	'ex-echarts-radial-chart',
	'ex-echarts-sankey-chart'
] as const;

function collectRuntimeErrors(page: Page) {
	const errors: string[] = [];
	page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
	page.on('pageerror', (error) => errors.push(String(error)));
	return errors;
}

test('every ECharts family initializes its Canvas renderer in production', async ({ page }) => {
	const errors = collectRuntimeErrors(page);

	for (const example of NATIVE_EXAMPLES) {
		await page.goto(`/preview/${example}?w=630&h=360`);
		await page.waitForSelector('[data-preview-ready]');
		await expect(page.locator('[data-slot="echarts-host"] canvas')).toBeVisible();
	}

	expect(errors).toEqual([]);
});

test('ECharts SVG and ordered-dither renderers initialize in production', async ({ page }) => {
	const errors = collectRuntimeErrors(page);

	await page.goto('/preview/ex-svg-renderer-echarts-area-chart?w=630&h=360');
	await page.waitForSelector('[data-preview-ready]');
	await expect(page.locator('[data-slot="echarts-host"] svg')).toBeVisible();

	await page.goto('/preview/ex-dither-echarts-area-chart?w=630&h=360');
	await page.waitForSelector('[data-preview-ready]');
	await expect(page.locator('[data-slot="echarts-host"] canvas')).toBeVisible();

	expect(errors).toEqual([]);
});
