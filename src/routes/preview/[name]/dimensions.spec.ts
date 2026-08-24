import { describe, expect, it } from 'vitest';
import { parsePreviewDimension, PREVIEW_HEIGHT, PREVIEW_WIDTH } from './dimensions.js';

describe('parsePreviewDimension', () => {
	it('uses the reference size for missing or malformed values', () => {
		expect(parsePreviewDimension(null, PREVIEW_WIDTH)).toBe(630);
		expect(parsePreviewDimension('1;position:fixed', PREVIEW_WIDTH)).toBe(630);
		expect(parsePreviewDimension('Infinity', PREVIEW_HEIGHT)).toBe(360);
	});

	it('clamps finite decimal dimensions to the preview bounds', () => {
		expect(parsePreviewDimension('12', PREVIEW_WIDTH)).toBe(240);
		expect(parsePreviewDimension('901.5', PREVIEW_WIDTH)).toBe(901.5);
		expect(parsePreviewDimension('5000', PREVIEW_HEIGHT)).toBe(1200);
	});
});
