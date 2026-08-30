import { expect, test } from '@playwright/test';
import { waitForPreview } from '$site/testing/wait-for-preview.js';

test('preview dimensions reject CSS input and clamp finite values', async ({ page }) => {
	await page.goto('/preview/ex-radial-chart?w=1%3Bposition%3Afixed%3Binset%3A0&h=not-a-size');
	await waitForPreview(page);

	const preview = page.locator('[data-slot="preview"]');
	const heightFrame = preview.locator('..');
	const card = heightFrame.locator('..');

	await expect(card).toHaveCSS('max-width', '630px');
	await expect(card).not.toHaveCSS('position', 'fixed');
	await expect(heightFrame).toHaveCSS('height', '360px');

	await page.goto('/preview/ex-radial-chart?w=12&h=5000');
	await waitForPreview(page);
	await expect(page.locator('[data-slot="preview"]').locator('..').locator('..')).toHaveCSS(
		'max-width',
		'240px'
	);
	await expect(page.locator('[data-slot="preview"]').locator('..')).toHaveCSS('height', '1200px');
});

test('preview consumers stop on the bounded terminal error marker', async ({ page }) => {
	await page.goto('/preview/preview-runtime-missing-test');

	await expect(waitForPreview(page)).rejects.toThrow('Preview failed to load: missing');
});
