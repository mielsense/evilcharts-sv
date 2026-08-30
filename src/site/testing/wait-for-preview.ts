import type { Page } from '@playwright/test';

const PREVIEW_TERMINAL_SELECTOR = '[data-preview-ready], [data-preview-error]';

export async function waitForPreview(page: Page) {
	const terminal = await page.waitForSelector(PREVIEW_TERMINAL_SELECTOR);
	const marker = await terminal.getAttribute('data-preview-error');
	if (marker === 'missing' || marker === 'failed') {
		throw new Error(`Preview failed to load: ${marker}`);
	}
	if (marker !== null) {
		throw new Error('Preview failed to load');
	}
}
