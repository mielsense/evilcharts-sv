import { describe, expect, it } from 'vitest';
import { computeSankey, type SankeyData } from './layout.js';

/**
 * The reference's `ex-sankey-chart` data, and the node rectangles Recharts lays out for it.
 *
 * Measured from the running reference docs page at a 598x328 surface with the default margin of 5,
 * which makes the plot 588x318. The layout is ported rather than mapped onto d3-sankey precisely so
 * these numbers can be asserted — see plans/DEVIATIONS.md S-1.
 */
const data: SankeyData = {
	nodes: [
		{ name: 'Organic' },
		{ name: 'PaidAds' },
		{ name: 'Social' },
		{ name: 'Landing' },
		{ name: 'Product' },
		{ name: 'Cart' },
		{ name: 'Purchase' },
		{ name: 'Bounced' }
	],
	links: [
		{ source: 0, target: 3, value: 42000 },
		{ source: 1, target: 3, value: 28000 },
		{ source: 2, target: 3, value: 18000 },
		{ source: 3, target: 4, value: 52000 },
		{ source: 3, target: 7, value: 36000 },
		{ source: 4, target: 5, value: 31000 },
		{ source: 4, target: 7, value: 21000 },
		{ source: 5, target: 6, value: 24000 },
		{ source: 5, target: 7, value: 7000 }
	]
};

/** `x`, `y`, `width`, `height` per node, in the order Recharts emits them. */
const EXPECTED = [
	{ x: 5, y: 5, width: 10, height: 142.227 },
	{ x: 5, y: 157.227, width: 10, height: 94.818 },
	{ x: 5, y: 262.045, width: 10, height: 60.955 },
	{ x: 149.5, y: 11.413, width: 10, height: 298 },
	{ x: 294, y: 77.956, width: 10, height: 176.091 },
	{ x: 438.5, y: 130.836, width: 10, height: 104.977 },
	{ x: 583, y: 241.727, width: 10, height: 81.273 },
	{ x: 583, y: 15, width: 10, height: 216.727 }
];

const INVALID_DATA_MESSAGE =
	'Sankey data must use integer in-range link endpoints, finite non-negative values, and contain no directed cycles.';

function layout() {
	return computeSankey({
		data,
		// A 598x328 surface with Recharts' default margin of 5.
		width: 588,
		height: 318,
		iterations: 32,
		nodeWidth: 10,
		nodePadding: 10,
		linkCurvature: 0.5,
		sort: true,
		align: 'justify',
		verticalAlign: 'justify',
		left: 5,
		top: 5
	});
}

function geometryNumbers(result: ReturnType<typeof computeSankey>) {
	return [
		...result.nodes.flatMap(({ x, y, width, height, index, payload }) => [
			x,
			y,
			width,
			height,
			index,
			payload.value,
			payload.depth,
			payload.x,
			payload.dx,
			payload.y,
			payload.dy
		]),
		...result.links.flatMap(
			({
				sourceX,
				targetX,
				sourceY,
				targetY,
				sourceControlX,
				targetControlX,
				linkWidth,
				index,
				payload
			}) => [
				sourceX,
				targetX,
				sourceY,
				targetY,
				sourceControlX,
				targetControlX,
				linkWidth,
				index,
				payload.value,
				payload.dy,
				payload.sy,
				payload.ty
			]
		)
	];
}

function expectInvalidData(invalidData: SankeyData) {
	let thrown: unknown;
	try {
		computeSankey({ ...layoutOptions(), data: invalidData });
	} catch (error) {
		thrown = error;
	}

	expect(thrown).toBeInstanceOf(RangeError);
	expect((thrown as RangeError).message).toBe(INVALID_DATA_MESSAGE);
}

describe('computeSankey', () => {
	it('places every node where Recharts does', () => {
		const { nodes } = layout();
		expect(nodes).toHaveLength(EXPECTED.length);

		EXPECTED.forEach((expected, index) => {
			const node = nodes[index];
			expect(node.payload.name, `node ${index} name`).toBe(data.nodes[index].name);
			expect(node.x, `node ${index} x`).toBeCloseTo(expected.x, 2);
			expect(node.y, `node ${index} y`).toBeCloseTo(expected.y, 2);
			expect(node.width, `node ${index} width`).toBe(expected.width);
			expect(node.height, `node ${index} height`).toBeCloseTo(expected.height, 2);
		});
	});

	it('anchors the first link on the first node’s right edge', () => {
		const { links } = layout();
		expect(links).toHaveLength(data.links.length);

		const first = links[0];
		// Recharts emits `M15,5 C82.25,5 82.25,11.4126 149.5,11.4126 …` for this data.
		expect(first.sourceX).toBeCloseTo(15, 2);
		expect(first.sourceY).toBeCloseTo(5 + first.linkWidth / 2, 2);
		expect(first.targetX).toBeCloseTo(149.5, 2);
		// `linkCurvature` 0.5 puts both control points midway between the columns.
		expect(first.sourceControlX).toBeCloseTo(82.25, 2);
		expect(first.targetControlX).toBeCloseTo(82.25, 2);
	});

	it('gives every link the height its value earns', () => {
		const { nodes, links } = layout();
		// The first node's three outgoing flows fill its whole height.
		const landing = nodes[3];
		const incoming = links.filter((link) => link.payload.target.name === 'Landing');
		const total = incoming.reduce((sum, link) => sum + link.linkWidth, 0);
		expect(total).toBeCloseTo(landing.height, 2);
	});

	it('keeps every reference coordinate and size finite and non-negative', () => {
		for (const value of geometryNumbers(layout())) {
			expect(Number.isFinite(value)).toBe(true);
			expect(value).toBeGreaterThanOrEqual(0);
		}
	});

	it('returns nothing before the plot has been measured', () => {
		expect(computeSankey({ ...layoutOptions(), width: 0 }).nodes).toEqual([]);
		expect(computeSankey({ ...layoutOptions(), height: 0 }).links).toEqual([]);
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
	])('rejects %s before layout', (_label, link) => {
		const invalidData: SankeyData = {
			nodes: [{ name: 'Source' }, { name: 'Target' }],
			links: [link]
		};

		expectInvalidData(invalidData);
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

	it('lays out a long acyclic chain without recursive traversal', () => {
		const nodeCount = 10_000;
		const chainData: SankeyData = {
			nodes: Array.from({ length: nodeCount }, (_, index) => ({ name: `Node ${index}` })),
			links: Array.from({ length: nodeCount - 1 }, (_, index) => ({
				source: index,
				target: index + 1,
				value: 1
			}))
		};

		const result = computeSankey({
			...layoutOptions(),
			data: chainData,
			width: 1_000,
			nodeWidth: 1,
			iterations: 0,
			verticalAlign: 'top'
		});

		expect(result.nodes).toHaveLength(nodeCount);
		expect(result.links).toHaveLength(nodeCount - 1);
		expect(result.nodes.at(-1)?.x).toBeGreaterThan(result.nodes[0].x);
		for (const value of geometryNumbers(result)) expect(Number.isFinite(value)).toBe(true);
	});

	it.each(['justify', 'top'] as const)(
		'keeps all-zero flow finite with %s vertical alignment',
		(verticalAlign) => {
			const zeroFlowData: SankeyData = {
				nodes: [{ name: 'Source' }, { name: 'Target' }],
				links: [{ source: 0, target: 1, value: 0 }]
			};

			const result = computeSankey({ ...layoutOptions(), data: zeroFlowData, verticalAlign });

			expect(result.nodes).toHaveLength(2);
			expect(result.links).toHaveLength(1);
			for (const value of geometryNumbers(result)) expect(Number.isFinite(value)).toBe(true);
		}
	);

	it('keeps isolated nodes finite', () => {
		const isolatedData: SankeyData = {
			nodes: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
			links: []
		};

		const result = computeSankey({ ...layoutOptions(), data: isolatedData });

		expect(result.nodes).toHaveLength(3);
		expect(result.links).toEqual([]);
		for (const value of geometryNumbers(result)) expect(Number.isFinite(value)).toBe(true);
	});

	it('keeps a zero-value link beside positive flow finite', () => {
		const mixedFlowData: SankeyData = {
			nodes: [{ name: 'Source' }, { name: 'Paid' }, { name: 'Free' }],
			links: [
				{ source: 0, target: 1, value: 5 },
				{ source: 0, target: 2, value: 0 }
			]
		};

		const result = computeSankey({ ...layoutOptions(), data: mixedFlowData });

		expect(result.nodes).toHaveLength(3);
		expect(result.links).toHaveLength(2);
		expect(result.links[1].linkWidth).toBe(0);
		for (const value of geometryNumbers(result)) expect(Number.isFinite(value)).toBe(true);
	});
});

function layoutOptions() {
	return {
		data,
		width: 588,
		height: 318,
		iterations: 32,
		nodeWidth: 10,
		nodePadding: 10,
		linkCurvature: 0.5,
		sort: true,
		align: 'justify' as const,
		verticalAlign: 'justify' as const,
		left: 5,
		top: 5
	};
}
