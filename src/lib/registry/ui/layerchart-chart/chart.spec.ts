import { describe, expect, it } from 'vitest';
import { validateChartConfigColors, type ChartConfig } from './chart-config.js';
import { distributeColors, getColorsCount } from './colors.js';
import { axisValueToPercentFormatter } from './format.js';
import { getLoadingData } from './loading.js';
import { getPayloadConfigFromPayload } from './payload.js';

describe('distributeColors', () => {
	it('truncates when there are at least as many colors as slots', () => {
		expect(distributeColors(['a', 'b', 'c', 'd'], 4)).toEqual(['a', 'b', 'c', 'd']);
		expect(distributeColors(['a', 'b', 'c'], 2)).toEqual(['a', 'b']);
	});

	it('gives the extra slots to the last colors', () => {
		// The reference documents these two cases directly.
		expect(distributeColors(['red', 'pink'], 4)).toEqual(['red', 'red', 'pink', 'pink']);
		expect(distributeColors(['red', 'pink', 'blue'], 4)).toEqual(['red', 'pink', 'blue', 'blue']);
	});

	it('repeats a single color across every slot', () => {
		expect(distributeColors(['a'], 3)).toEqual(['a', 'a', 'a']);
	});

	it('never returns more than maxCount entries', () => {
		for (let colors = 1; colors <= 6; colors++) {
			for (let slots = 1; slots <= 8; slots++) {
				const input = Array.from({ length: colors }, (_, i) => `c${i}`);
				expect(distributeColors(input, slots)).toHaveLength(slots);
			}
		}
	});
});

describe('getColorsCount', () => {
	it('is 1 when there are no colors', () => {
		expect(getColorsCount({})).toBe(1);
	});

	it('takes the maximum across themes', () => {
		expect(getColorsCount({ colors: { light: ['a'], dark: ['a', 'b', 'c'] } })).toBe(3);
		expect(getColorsCount({ colors: { light: ['a', 'b'] } })).toBe(2);
	});

	it('never drops below 1', () => {
		expect(getColorsCount({ colors: { light: [] } })).toBe(1);
	});
});

describe('validateChartConfigColors', () => {
	it('accepts a config with at least one theme key', () => {
		expect(() =>
			validateChartConfigColors({ desktop: { colors: { light: ['#000'] } } })
		).not.toThrow();
	});

	it('accepts entries without colors at all', () => {
		expect(() => validateChartConfigColors({ desktop: { label: 'Desktop' } })).not.toThrow();
	});

	it('throws the reference message for an empty colors object', () => {
		const config = { desktop: { colors: {} } } as unknown as ChartConfig;
		expect(() => validateChartConfigColors(config)).toThrow(
			'[EvilCharts] Invalid chart config for "desktop": colors object must have at least one theme key (light, dark). Received empty object or invalid keys.'
		);
	});
});

describe('getPayloadConfigFromPayload', () => {
	const config: ChartConfig = {
		desktop: { label: 'Desktop' },
		chrome: { label: 'Chrome' },
		value: { label: 'Value' }
	};

	it('returns undefined for non-object payloads', () => {
		expect(getPayloadConfigFromPayload(config, null, 'desktop')).toBeUndefined();
		expect(getPayloadConfigFromPayload(config, 'desktop', 'desktop')).toBeUndefined();
	});

	it('resolves through a string value on the payload itself', () => {
		expect(getPayloadConfigFromPayload(config, { name: 'chrome' }, 'name')).toEqual(config.chrome);
	});

	it('resolves through a string value on the nested payload', () => {
		expect(
			getPayloadConfigFromPayload(config, { payload: { browser: 'chrome' } }, 'browser')
		).toEqual(config.chrome);
	});

	it('falls back to the key itself when no indirection applies', () => {
		expect(getPayloadConfigFromPayload(config, { dataKey: 'desktop' }, 'desktop')).toEqual(
			config.desktop
		);
	});

	it('returns undefined when neither the resolved label nor the key is configured', () => {
		expect(getPayloadConfigFromPayload(config, { name: 'safari' }, 'name')).toBeUndefined();
	});
});

describe('axisValueToPercentFormatter', () => {
	it('renders a normalized value as a whole percentage', () => {
		expect(axisValueToPercentFormatter(0)).toBe('0%');
		expect(axisValueToPercentFormatter(0.5)).toBe('50%');
		expect(axisValueToPercentFormatter(1)).toBe('100%');
		expect(axisValueToPercentFormatter(0.256)).toBe('26%');
	});
});

describe('getLoadingData', () => {
	it('defaults to 10 points inside [0, 70)', () => {
		const data = getLoadingData();
		expect(data).toHaveLength(10);
		expect(data.every((d) => d.loading >= 0 && d.loading < 70)).toBe(true);
		expect(data.map((d) => d.__loadingCategory)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	});

	it('honours point count and bounds', () => {
		const data = getLoadingData(14, 20, 80);
		expect(data).toHaveLength(14);
		expect(data.every((d) => d.loading >= 20 && d.loading < 80)).toBe(true);
	});
});
