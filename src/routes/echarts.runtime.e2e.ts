import { expect, test, type Page } from '@playwright/test';
import { waitForPreview } from '$site/testing/wait-for-preview.js';

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
		await waitForPreview(page);
		await expect(page.locator('[data-slot="echarts-host"] canvas')).toBeVisible();
	}

	expect(errors).toEqual([]);
});

test('ECharts SVG and ordered-dither renderers initialize in production', async ({ page }) => {
	const errors = collectRuntimeErrors(page);

	await page.goto('/preview/ex-svg-renderer-echarts-area-chart?w=630&h=360');
	await waitForPreview(page);
	await expect(page.locator('[data-slot="echarts-host"] svg')).toBeVisible();

	await page.goto('/preview/ex-dither-echarts-area-chart?w=630&h=360');
	await waitForPreview(page);
	await expect(page.locator('[data-slot="echarts-host"] canvas')).toBeVisible();

	expect(errors).toEqual([]);
});

test('ECharts overlays and radial legend use the upstream chart bounds', async ({ page }) => {
	await page.goto('/preview/ex-echarts-area-chart?w=632&h=360');
	await waitForPreview(page);
	const area = page.locator('[data-slot="chart"]');
	const areaGeometry = await area.evaluate((chart) => {
		const chartRect = chart.getBoundingClientRect();
		const legend = [...chart.querySelectorAll<HTMLElement>('div')].find(
			(element) => element.textContent?.replace(/\s+/g, '') === 'DesktopMobile'
		)!;
		const legendRect = legend.getBoundingClientRect();
		return {
			chart: { x: chartRect.x, y: chartRect.y, width: chartRect.width },
			legend: { x: legendRect.x, y: legendRect.y, width: legendRect.width }
		};
	});
	expect(areaGeometry.legend).toEqual({
		x: areaGeometry.chart.x + 16,
		y: areaGeometry.chart.y + 12,
		width: areaGeometry.chart.width - 32
	});

	await page.goto('/preview/ex-echarts-radial-chart?w=632&h=360');
	await waitForPreview(page);
	const radial = page.locator('[data-slot="chart"]');
	const radialGeometry = await radial.evaluate((chart) => {
		const chartRect = chart.getBoundingClientRect();
		const hostRect = chart
			.querySelector<HTMLElement>('[data-slot="echarts-host"]')!
			.getBoundingClientRect();
		return { chartHeight: chartRect.height, hostHeight: hostRect.height };
	});
	// 16px chart padding on each edge plus the original 32px flowing legend band.
	expect(radialGeometry.chartHeight).toBe(360);
	expect(radialGeometry.hostHeight).toBe(296);
});
