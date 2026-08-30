import { describe, expect, it } from 'vitest';
import { computeNodeDepths, computeNodeValues } from './option.js';
import type { SankeyData } from './types.js';
import {
	getRenderableSankeyData,
	SANKEY_VALIDATION_ERROR_CODE,
	SANKEY_VALIDATION_ERROR_MESSAGE,
	SankeyValidationError,
	validateSankeyData
} from './validation.js';

const INVALID_DATA_MESSAGE =
	'Sankey data requires integer in-range link endpoints, finite non-negative values, representable aggregate flows and layout scale, and no directed cycles.';

function expectInvalidData(invalidData: SankeyData) {
	let thrown: unknown;
	try {
		validateSankeyData(invalidData);
	} catch (error) {
		thrown = error;
	}

	expect(thrown).toBeInstanceOf(RangeError);
	expect(thrown).toBeInstanceOf(SankeyValidationError);
	expect(thrown).toMatchObject({
		name: 'SankeyValidationError',
		code: SANKEY_VALIDATION_ERROR_CODE
	});
	expect((thrown as RangeError).message).toBe(INVALID_DATA_MESSAGE);
	expect(getRenderableSankeyData(invalidData)).toEqual({ nodes: [], links: [] });
}

describe('ECharts Sankey data validation', () => {
	it('exports a stable recognizable validation contract', () => {
		expect(SANKEY_VALIDATION_ERROR_CODE).toBe('INVALID_SANKEY_DATA');
		expect(SANKEY_VALIDATION_ERROR_MESSAGE).toBe(INVALID_DATA_MESSAGE);
	});

	it.each([
		['a negative value', { source: 0, target: 1, value: -1 }],
		['a NaN value', { source: 0, target: 1, value: Number.NaN }],
		['an infinite value', { source: 0, target: 1, value: Number.POSITIVE_INFINITY }],
		['a fractional source', { source: 0.5, target: 1, value: 1 }],
		['a negative source', { source: -1, target: 1, value: 1 }],
		['a source past the node list', { source: 2, target: 1, value: 1 }],
		['a fractional target', { source: 0, target: 0.5, value: 1 }],
		['a negative target', { source: 0, target: -1, value: 1 }],
		['a target past the node list', { source: 0, target: 2, value: 1 }],
		['a self-link', { source: 0, target: 0, value: 1 }]
	])('rejects %s before ECharts option construction', (_label, link) => {
		expectInvalidData({
			nodes: [{ name: 'Source' }, { name: 'Target' }],
			links: [link]
		});
	});

	it.each([
		[
			'a two-node cycle',
			{
				nodes: [{ name: 'A' }, { name: 'B' }],
				links: [
					{ source: 0, target: 1, value: 1 },
					{ source: 1, target: 0, value: 1 }
				]
			}
		],
		[
			'a longer reachable cycle',
			{
				nodes: [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }],
				links: [
					{ source: 0, target: 1, value: 1 },
					{ source: 1, target: 2, value: 1 },
					{ source: 2, target: 3, value: 1 },
					{ source: 3, target: 1, value: 1 }
				]
			}
		],
		[
			'a disconnected cycle',
			{
				nodes: [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }],
				links: [
					{ source: 0, target: 1, value: 1 },
					{ source: 2, target: 3, value: 1 },
					{ source: 3, target: 2, value: 1 }
				]
			}
		]
	] satisfies [string, SankeyData][])('rejects %s', (_label, cyclicData) => {
		expectInvalidData(cyclicData);
	});

	it('rejects finite links whose aggregate flow cannot be represented', () => {
		expectInvalidData({
			nodes: [{ name: 'Source' }, { name: 'Target' }],
			links: [
				{ source: 0, target: 1, value: Number.MAX_VALUE },
				{ source: 0, target: 1, value: Number.MAX_VALUE }
			]
		});
	});

	it('rejects a finite value range that cannot be represented after scaling', () => {
		expectInvalidData({
			nodes: [{ name: 'Source' }, { name: 'Large target' }, { name: 'Tiny target' }],
			links: [
				{ source: 0, target: 1, value: Number.MAX_VALUE / 2 },
				{ source: 0, target: 2, value: Number.MIN_VALUE }
			]
		});
	});

	it('validates before deriving node values or depths', () => {
		const cyclicData: SankeyData = {
			nodes: [{ name: 'A' }, { name: 'B' }],
			links: [
				{ source: 0, target: 1, value: 1 },
				{ source: 1, target: 0, value: 1 }
			]
		};

		expect(() => computeNodeValues(cyclicData)).toThrow(SankeyValidationError);
		expect(() => computeNodeDepths(cyclicData)).toThrow(SankeyValidationError);
	});

	it('keeps valid extreme, zero, and isolated inputs renderable', () => {
		const validInputs: SankeyData[] = [
			{
				nodes: [{ name: 'Source' }, { name: 'Target' }],
				links: [{ source: 0, target: 1, value: Number.MIN_VALUE }]
			},
			{
				nodes: [{ name: 'Source' }, { name: 'Target' }],
				links: [{ source: 0, target: 1, value: Number.MAX_VALUE / 2 }]
			},
			{
				nodes: [{ name: 'Source' }, { name: 'Target' }],
				links: [{ source: 0, target: 1, value: 0 }]
			},
			{ nodes: [{ name: 'A' }, { name: 'B' }, { name: 'C' }], links: [] }
		];

		for (const validData of validInputs) {
			expect(getRenderableSankeyData(validData)).toBe(validData);
		}
	});

	it('does not swallow unexpected data access errors', () => {
		const unexpected = new RangeError('Unexpected data failure.');
		const dataWithUnexpectedGetter = {
			get nodes() {
				throw unexpected;
			},
			links: []
		} as unknown as SankeyData;

		expect(() => getRenderableSankeyData(dataWithUnexpectedGetter)).toThrow(unexpected);
	});
});
