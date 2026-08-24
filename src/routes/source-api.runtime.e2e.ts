import { expect, test } from '@playwright/test';

test('source metadata stays small and the selected file loads separately', async ({ request }) => {
	const metadataResponse = await request.get('/api/source/layerchart-chart');
	expect(metadataResponse.status()).toBe(200);

	const metadata = (await metadataResponse.json()) as {
		name: string;
		files: Array<Record<string, unknown>>;
	};
	expect(metadata.name).toBe('layerchart-chart');
	expect(metadata.files.length).toBeGreaterThan(1);
	expect(metadata.files[0]).toEqual(
		expect.objectContaining({
			path: 'animated-grow.svelte',
			language: 'svelte',
			url: '/api/source-file/layerchart-chart/0'
		})
	);
	expect(metadata.files[0]).not.toHaveProperty('code');
	expect(metadata.files[0]).not.toHaveProperty('html');

	const fileResponse = await request.get(String(metadata.files[0].url));
	expect(fileResponse.status()).toBe(200);
	const file = (await fileResponse.json()) as Record<string, unknown>;
	expect(file).toEqual(
		expect.objectContaining({
			path: 'animated-grow.svelte',
			language: 'svelte'
		})
	);
	expect(file.code).toContain('<script lang="ts">');
	expect(file.html).toContain('class="shiki');
});

test('component source reuses metadata and selected-file payloads across docs navigation', async ({
	page
}) => {
	const requests: string[] = [];
	page.on('request', (request) => {
		const pathname = new URL(request.url()).pathname;
		if (
			pathname === '/api/source/layerchart-chart' ||
			pathname === '/api/source-file/layerchart-chart/0'
		) {
			requests.push(pathname);
		}
	});

	await page.goto('/docs/layerchart/area-chart');
	const manualTab = page.getByRole('tab', { name: 'Manual', exact: true });
	await expect(async () => {
		await manualTab.click();
		await expect(manualTab).toHaveAttribute('aria-selected', 'true', { timeout: 1_000 });
	}).toPass({ timeout: 15_000 });
	await expect(page.getByRole('tab', { name: 'animated-grow.svelte', exact: true })).toBeVisible({
		timeout: 15_000
	});

	await page
		.locator('a[href="/docs/layerchart/bar-chart"]')
		.first()
		.evaluate((link: HTMLAnchorElement) => link.click());
	await expect(page.getByRole('heading', { level: 1, name: 'Bar Chart' })).toBeVisible();
	await expect(page.getByRole('tab', { name: 'animated-grow.svelte', exact: true })).toBeVisible({
		timeout: 15_000
	});

	expect(requests.filter((path) => path === '/api/source/layerchart-chart')).toHaveLength(1);
	expect(requests.filter((path) => path === '/api/source-file/layerchart-chart/0')).toHaveLength(1);
});
