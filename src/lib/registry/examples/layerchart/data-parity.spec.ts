import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

type Datum = Record<string, number | string>;

const directory = fileURLToPath(new URL('.', import.meta.url));

const canonicalLineData: Datum[] = [
	{ month: 'January', desktop: 342, mobile: 184 },
	{ month: 'February', desktop: 876, mobile: 491 },
	{ month: 'March', desktop: 512, mobile: 290 },
	{ month: 'April', desktop: 629, mobile: 391 },
	{ month: 'May', desktop: 458, mobile: 309 },
	{ month: 'June', desktop: 781, mobile: 449 },
	{ month: 'July', desktop: 394, mobile: 234 },
	{ month: 'August', desktop: 925, mobile: 557 },
	{ month: 'September', desktop: 647, mobile: 367 },
	{ month: 'October', desktop: 532, mobile: 357 },
	{ month: 'November', desktop: 803, mobile: 515 },
	{ month: 'December', desktop: 271, mobile: 149 }
];

const canonicalBufferBarData: Datum[] = [
	...canonicalLineData.slice(0, 10),
	{ month: 'November', desktop: 503, mobile: 215 },
	{ month: 'December', desktop: 971, mobile: 749 }
];

const canonicalHorizontalBarData: Datum[] = [
	{ month: 'January', desktop: 186 },
	{ month: 'February', desktop: 305 },
	{ month: 'March', desktop: 237 },
	{ month: 'April', desktop: 173 },
	{ month: 'May', desktop: 209 },
	{ month: 'June', desktop: 214 }
];

const lineExamples = [
	'ex-animated-dashed-stroke-line-chart',
	'ex-bg-4-pointed-star-line-chart',
	'ex-bg-bubbles-line-chart',
	'ex-bg-cross-hatch-line-chart',
	'ex-bg-diagonal-lines-line-chart',
	'ex-bg-dots-line-chart',
	'ex-bg-falling-triangles-line-chart',
	'ex-bg-grid-line-chart',
	'ex-bg-overlapping-circles-line-chart',
	'ex-bg-plus-line-chart',
	'ex-bg-tiny-checkers-line-chart',
	'ex-bg-wiggle-lines-line-chart',
	'ex-buffer-line-chart',
	'ex-bump-curve-type-line-chart',
	'ex-dashed-stroke-line-chart',
	'ex-dot-border-line-chart',
	'ex-dot-colored-border-line-chart',
	'ex-dot-default-line-chart',
	'ex-glowing-desktop-line-chart',
	'ex-glowing-mobile-line-chart',
	'ex-gradient-colors-bump-line-chart',
	'ex-gradient-colors-line-chart',
	'ex-legend-circle-line-chart',
	'ex-legend-circle-outline-line-chart',
	'ex-legend-horizontal-bar-line-chart',
	'ex-legend-rounded-square-line-chart',
	'ex-legend-rounded-square-outline-line-chart',
	'ex-legend-square-line-chart',
	'ex-legend-vertical-bar-line-chart',
	'ex-line-chart',
	'ex-monotoney-curve-type-line-chart',
	'ex-solid-stroke-line-chart',
	'ex-step-curve-type-line-chart'
];

function readData(fileName: string): Datum[] {
	const source = readFileSync(`${directory}/${fileName}.svelte`, 'utf8');
	const array = source.match(/const data = \[([\s\S]*?)\n\t\];/)?.[1];

	if (!array) throw new Error(`Could not find the data array in ${fileName}.svelte`);

	return [...array.matchAll(/\{([^{}]+)\}/g)].map(([, body]) => {
		const datum: Datum = {};

		for (const match of body.matchAll(/(\w+)\s*:\s*(?:'([^']*)'|"([^"]*)"|(-?\d+(?:\.\d+)?))/g)) {
			const [, key, singleQuoted, doubleQuoted, numeric] = match;
			datum[key] = numeric === undefined ? (singleQuoted ?? doubleQuoted) : Number(numeric);
		}

		return datum;
	});
}

describe('translated example data', () => {
	it.each(lineExamples)('%s uses the original line-chart dataset', (fileName) => {
		expect(readData(fileName)).toEqual(canonicalLineData);
	});

	it('keeps the original buffer-bar outliers', () => {
		expect(readData('ex-buffer-bar-chart')).toEqual(canonicalBufferBarData);
	});

	it('keeps the original six-row horizontal-bar dataset', () => {
		expect(readData('ex-horizontal-layout-bar-chart')).toEqual(canonicalHorizontalBarData);
	});
});
