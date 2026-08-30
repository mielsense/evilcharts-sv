/** @param {import('playwright').Page} page */
export async function waitForPreview(page) {
	const terminal = await page.waitForSelector('[data-preview-ready], [data-preview-error]');
	const marker = await terminal.getAttribute('data-preview-error');
	if (marker === 'missing' || marker === 'failed') {
		throw new Error(`Preview failed to load: ${marker}`);
	}
	if (marker !== null) {
		throw new Error('Preview failed to load');
	}
}
