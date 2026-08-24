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

test('the landing stage completes a focus hop without runtime diagnostics', async ({ page }) => {
	const diagnostics = collectRuntimeDiagnostics(page);
	await page.route('https://api.github.com/repos/legions-developer/evilcharts', (route) =>
		route.fulfill({ status: 200, contentType: 'application/json', body: '{"stargazers_count":0}' })
	);
	await page.addInitScript(() => {
		window.addEventListener('error', (event) => {
			console.error(`[window-error] ${event.message}`);
		});
	});

	await page.goto('/');
	await page.waitForTimeout(FIRST_FOCUS_HOP_WAIT_MS);

	expect(diagnostics).toEqual([]);
});
