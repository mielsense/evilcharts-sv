import { expect, test, type Page } from '@playwright/test';

// The stage's first automatic focus hop runs at 4.6s. Keep this comfortably beyond that boundary
// so the test exercises the prop update that previously read destroyed motion derivations.
const FIRST_FOCUS_HOP_WAIT_MS = 5_600;

function collectRuntimeDiagnostics(page: Page) {
	const diagnostics: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'warning' || message.type() === 'error') {
			diagnostics.push(`${message.type()}: ${message.text()}`);
		}
	});
	page.on('pageerror', (error) => diagnostics.push(`pageerror: ${String(error)}`));

	return diagnostics;
}

async function prepareRuntimePage(page: Page) {
	const diagnostics = collectRuntimeDiagnostics(page);
	await page.route('https://api.github.com/repos/**', (route) =>
		route.fulfill({ status: 200, contentType: 'application/json', body: '{"stargazers_count":0}' })
	);
	await page.addInitScript(() => {
		window.addEventListener('error', (event) => {
			console.error(`[window-error] ${event.message}`);
		});
	});
	return diagnostics;
}

test('the landing stage completes a focus hop without runtime diagnostics', async ({ page }) => {
	const diagnostics = await prepareRuntimePage(page);

	await page.goto('/');
	await page.waitForTimeout(FIRST_FOCUS_HOP_WAIT_MS);

	expect(diagnostics).toEqual([]);
});

test('chart previews survive resize, navigation, and unmount without runtime diagnostics', async ({
	page
}) => {
	const diagnostics = await prepareRuntimePage(page);

	await page.goto('/preview/ex-bar-chart?w=630&h=360');
	await page.waitForSelector('[data-preview-ready]');
	await page.setViewportSize({ width: 820, height: 520 });
	await page.goto('/preview/ex-area-chart?w=630&h=360');
	await page.waitForSelector('[data-preview-ready]');
	await page.goto('/preview/ex-line-chart?w=630&h=360');
	await page.waitForSelector('[data-preview-ready]');
	await page.goto('/preview/ex-loading-state-area-chart?w=630&h=360');
	await page.waitForSelector('[data-preview-ready]');
	await page.waitForTimeout(1_200);
	await page.goto('/preview/b-isometric-bar-chart?w=630&h=360');
	await page.waitForSelector('[data-preview-ready]');
	await page.goto('/preview/b-monospace-bar-chart?w=630&h=360');
	await page.waitForSelector('[data-preview-ready]');
	await page.goto('/docs/layerchart/bar-chart');
	await page.waitForTimeout(800);

	expect(diagnostics).toEqual([]);
});

test('reduced motion leaves loading previews without running animations', async ({ page }) => {
	const diagnostics = await prepareRuntimePage(page);
	await page.emulateMedia({ reducedMotion: 'reduce' });

	for (const name of [
		'ex-loading-state-area-chart',
		'ex-loading-state-pie-chart',
		'ex-loading-state-radar-chart',
		'ex-loading-state-radial-chart',
		'ex-loading-state-sankey-chart',
		'b-isometric-bar-chart',
		'b-monospace-bar-chart'
	]) {
		await page.goto(`/preview/${name}?w=630&h=360`);
		await page.waitForSelector('[data-preview-ready]');
		await page.waitForTimeout(250);

		const runningAnimations = await page.evaluate(() =>
			document
				.getAnimations()
				.filter((animation) => animation.playState === 'running')
				.map((animation) => String(animation.effect?.getTiming().duration))
		);
		expect(runningAnimations, name).toEqual([]);
	}

	expect(diagnostics).toEqual([]);
});
