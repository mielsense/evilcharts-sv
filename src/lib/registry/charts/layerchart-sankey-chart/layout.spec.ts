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

	it('returns nothing before the plot has been measured', () => {
		expect(computeSankey({ ...layoutOptions(), width: 0 }).nodes).toEqual([]);
		expect(computeSankey({ ...layoutOptions(), height: 0 }).links).toEqual([]);
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
