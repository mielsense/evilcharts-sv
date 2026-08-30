import { describe, expect, it } from 'vitest';
import type { Page } from '@playwright/test';
import { waitForPreview } from './wait-for-preview.js';

function pageWithTerminalState(error: string | null) {
	return {
		waitForSelector: async (selector: string) => {
			if (selector !== '[data-preview-ready], [data-preview-error]') {
				throw new Error(`Unexpected terminal selector: ${selector}`);
			}
			return {
				getAttribute: async (name: string) => (name === 'data-preview-error' ? error : null)
			};
		}
	} as unknown as Page;
}

describe('waitForPreview', () => {
	it('returns when the preview reaches ready', async () => {
		await expect(waitForPreview(pageWithTerminalState(null))).resolves.toBeUndefined();
	});

	it.each(['missing', 'failed'])('fails with the bounded %s marker', async (marker) => {
		await expect(waitForPreview(pageWithTerminalState(marker))).rejects.toThrow(
			`Preview failed to load: ${marker}`
		);
	});
});
