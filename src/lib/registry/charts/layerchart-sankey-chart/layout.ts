/**
 * Sankey layout, ported from Recharts' own algorithm.
 *
 * Recharts does **not** use `d3-sankey`: `chart/Sankey.js` carries its own layout with `align`,
 * `verticalAlign`, `sort` and a relaxation loop, and d3-sankey's numbers differ. Since node
 * positions have to match the reference pixel for pixel, the algorithm is ported here rather than
 * mapped onto LayerChart's d3-sankey wrapper.
 *
 * Everything below is a direct translation of `getNodesTree` → `getDepthTree` → `updateYOfTree` →
 * `resolveCollisions` → `relaxRightToLeft`/`relaxLeftToRight` → `updateYOfLinks` → `computeData`,
 * keeping the same iteration order, the same `alpha *= 0.99` decay, and the same in-place mutation
 * of `sy`/`ty`, because each of those affects the result.
 */

export type SankeyInputNode = Record<string, unknown> & { name: string };
export type SankeyInputLink = Record<string, unknown> & {
	source: number;
	target: number;
	value: number;
};
export type SankeyData = { nodes: SankeyInputNode[]; links: SankeyInputLink[] };

export type LaidOutNode = SankeyInputNode & {
	sourceNodes: number[];
	sourceLinks: number[];
	targetNodes: number[];
	targetLinks: number[];
	value: number;
	depth: number;
	x: number;
	dx: number;
	y: number;
	dy: number;
};

export type LaidOutLink = SankeyInputLink & { dy: number; sy: number; ty: number };

/** Node rectangle handed to the renderer, in chart coordinates. */
export type SankeyNodeShape = {
	x: number;
	y: number;
	width: number;
	height: number;
	index: number;
	payload: LaidOutNode;
};

/** Link band handed to the renderer, in chart coordinates. */
export type SankeyLinkShape = {
	sourceX: number;
	targetX: number;
	sourceY: number;
	targetY: number;
	sourceControlX: number;
	targetControlX: number;
	linkWidth: number;
	index: number;
	payload: Omit<LaidOutLink, 'source' | 'target'> & {
		source: LaidOutNode;
		target: LaidOutNode;
	};
};

const interpolationGenerator = (a: number, b: number) => {
	const ka = +a;
	const kb = b - ka;
	return (t: number) => ka + kb * t;
};

const centerY = (node: LaidOutNode) => node.y + node.dy / 2;

const getValue = (entry: { value?: number } | undefined) => (entry && entry.value) || 0;

const getSumOfIds = (links: LaidOutLink[], ids: number[]) =>
	ids.reduce((result, id) => result + getValue(links[id]), 0);

const getSumWithWeightedSource = (tree: LaidOutNode[], links: LaidOutLink[], ids: number[]) =>
	ids.reduce((result, id) => {
		const link = links[id];
		if (link == null) return result;

		const sourceNode = tree[link.source];
		if (sourceNode == null) return result;

		return result + centerY(sourceNode) * getValue(links[id]);
	}, 0);

const getSumWithWeightedTarget = (tree: LaidOutNode[], links: LaidOutLink[], ids: number[]) =>
	ids.reduce((result, id) => {
		const link = links[id];
		if (link == null) return result;

		const targetNode = tree[link.target];
		if (targetNode == null) return result;

		return result + centerY(targetNode) * getValue(links[id]);
	}, 0);

const ascendingY = (a: LaidOutNode, b: LaidOutNode) => a.y - b.y;

function searchTargetsAndSources(links: SankeyInputLink[], id: number) {
	const sourceNodes: number[] = [];
	const sourceLinks: number[] = [];
	const targetNodes: number[] = [];
	const targetLinks: number[] = [];

	for (let i = 0, len = links.length; i < len; i++) {
		const link = links[i];
		if (link?.source === id) {
			targetNodes.push(link.target);
			targetLinks.push(i);
		}
		if (link?.target === id) {
			sourceNodes.push(link.source);
			sourceLinks.push(i);
		}
	}

	return { sourceNodes, sourceLinks, targetLinks, targetNodes };
}

function updateDepthOfTargets(tree: LaidOutNode[], curNode: LaidOutNode) {
	for (const targetNode of curNode.targetNodes) {
		if (targetNode == null) continue;

		const target = tree[targetNode];
		if (target) {
			target.depth = Math.max(curNode.depth + 1, target.depth);
			updateDepthOfTargets(tree, target);
		}
	}
}

function getNodesTree(
	{ nodes, links }: SankeyData,
	width: number,
	nodeWidth: number,
	align: 'left' | 'justify'
) {
	const tree = nodes.map((entry, index) => {
		const result = searchTargetsAndSources(links, index);

		return {
			...entry,
			...result,
			value: Math.max(
				getSumOfIds(links as LaidOutLink[], result.sourceLinks),
				getSumOfIds(links as LaidOutLink[], result.targetLinks)
			),
			depth: 0,
			x: 0,
			dx: nodeWidth,
			y: 0,
			dy: 0
		} as LaidOutNode;
	});

	for (const node of tree) {
		if (node != null && !node.sourceNodes.length) {
			updateDepthOfTargets(tree, node);
		}
	}

	const maxDepth = tree.reduce((max, entry) => Math.max(max, entry.depth), 0);

	if (maxDepth >= 1) {
		const childWidth = (width - nodeWidth) / maxDepth;
		for (const node of tree) {
			if (node == null) continue;
			// `justify` pushes every leaf out to the last column; `left` leaves it where it landed.
			if (!node.targetNodes.length && align === 'justify') {
				node.depth = maxDepth;
			}
			node.x = node.depth * childWidth;
			node.dx = nodeWidth;
		}
	}

	return { tree, maxDepth };
}

function getDepthTree(tree: LaidOutNode[]) {
	const result: LaidOutNode[][] = [];

	for (const node of tree) {
		if (node == null) continue;
		if (!result[node.depth]) result[node.depth] = [];
		result[node.depth].push(node);
	}

	return result;
}

function updateYOfTree(
	depthTree: LaidOutNode[][],
	height: number,
	nodePadding: number,
	links: SankeyInputLink[],
	verticalAlign: 'justify' | 'top'
): LaidOutLink[] {
	const yRatio = Math.min(
		...depthTree.map(
			(nodes) =>
				(height - (nodes.length - 1) * nodePadding) /
				nodes.reduce((sum, node) => sum + getValue(node), 0)
		)
	);

	for (const nodes of depthTree) {
		if (nodes == null) continue;

		if (verticalAlign === 'top') {
			let currentY = 0;
			for (const node of nodes) {
				if (node == null) continue;
				node.dy = node.value * yRatio;
				node.y = currentY;
				currentY += node.dy + nodePadding;
			}
		} else {
			// The relaxation loop below starts from the node's index, exactly as Recharts does.
			nodes.forEach((node, index) => {
				if (node == null) return;
				node.y = index;
				node.dy = node.value * yRatio;
			});
		}
	}

	return links.map((link) => ({ ...link, dy: getValue(link) * yRatio, sy: 0, ty: 0 }));
}

function resolveCollisions(
	depthTree: LaidOutNode[][],
	height: number,
	nodePadding: number,
	sort = true
) {
	for (const nodes of depthTree) {
		if (nodes == null) continue;
		const n = nodes.length;

		// Sort by the value of y
		if (sort) nodes.sort(ascendingY);

		let y0 = 0;
		for (let j = 0; j < n; j++) {
			const node = nodes[j];
			if (node == null) continue;

			const dy = y0 - node.y;
			if (dy > 0) node.y += dy;
			y0 = node.y + node.dy + nodePadding;
		}

		y0 = height + nodePadding;
		for (let j = n - 1; j >= 0; j--) {
			const node = nodes[j];
			if (node == null) continue;

			const dy = node.y + node.dy + nodePadding - y0;
			if (dy > 0) {
				node.y -= dy;
				y0 = node.y;
			} else {
				break;
			}
		}
	}
}

function relaxLeftToRight(
	tree: LaidOutNode[],
	depthTree: LaidOutNode[][],
	links: LaidOutLink[],
	alpha: number
) {
	for (const nodes of depthTree) {
		if (nodes == null) continue;
		for (const node of nodes) {
			if (node == null || !node.sourceLinks.length) continue;

			const sourceSum = getSumOfIds(links, node.sourceLinks);
			const weightedSum = getSumWithWeightedSource(tree, links, node.sourceLinks);
			const y = weightedSum / sourceSum;
			node.y += (y - centerY(node)) * alpha;
		}
	}
}

function relaxRightToLeft(
	tree: LaidOutNode[],
	depthTree: LaidOutNode[][],
	links: LaidOutLink[],
	alpha: number
) {
	for (let i = depthTree.length - 1; i >= 0; i--) {
		const nodes = depthTree[i];
		if (nodes == null) continue;

		for (const node of nodes) {
			if (node == null || !node.targetLinks.length) continue;

			const targetSum = getSumOfIds(links, node.targetLinks);
			const weightedSum = getSumWithWeightedTarget(tree, links, node.targetLinks);
			const y = weightedSum / targetSum;
			node.y += (y - centerY(node)) * alpha;
		}
	}
}

function updateYOfLinks(tree: LaidOutNode[], links: LaidOutLink[]) {
	for (const node of tree) {
		if (node == null) continue;

		let sy = 0;
		let ty = 0;

		node.targetLinks.sort((a, b) => {
			const yA = tree[links[a]?.target]?.y;
			const yB = tree[links[b]?.target]?.y;
			if (yA == null || yB == null) return 0;
			return yA - yB;
		});
		node.sourceLinks.sort((a, b) => {
			const yA = tree[links[a]?.source]?.y;
			const yB = tree[links[b]?.source]?.y;
			if (yA == null || yB == null) return 0;
			return yA - yB;
		});

		for (const targetLink of node.targetLinks) {
			if (targetLink == null) continue;
			const link = links[targetLink];
			if (link) {
				link.sy = sy;
				sy += link.dy;
			}
		}
		for (const sourceLink of node.sourceLinks) {
			if (sourceLink == null) continue;
			const link = links[sourceLink];
			if (link) {
				link.ty = ty;
				ty += link.dy;
			}
		}
	}
}

export type SankeyLayoutOptions = {
	data: SankeyData;
	/** Plot width, already inside the chart margin. */
	width: number;
	/** Plot height, already inside the chart margin. */
	height: number;
	iterations: number;
	nodeWidth: number;
	nodePadding: number;
	linkCurvature: number;
	sort: boolean;
	align: 'left' | 'justify';
	verticalAlign: 'justify' | 'top';
	/** Chart margin, added to every coordinate exactly as Recharts' `left`/`top` do. */
	left: number;
	top: number;
};

/** Runs the layout and returns the node rectangles and link bands ready to draw. */
export function computeSankey(options: SankeyLayoutOptions): {
	nodes: SankeyNodeShape[];
	links: SankeyLinkShape[];
} {
	const {
		data,
		width,
		height,
		iterations,
		nodeWidth,
		nodePadding,
		linkCurvature,
		sort,
		align,
		verticalAlign,
		left,
		top
	} = options;

	if (data.nodes.length === 0 || !(width > 0) || !(height > 0)) {
		return { nodes: [], links: [] };
	}

	const { tree } = getNodesTree(data, width, nodeWidth, align);
	const depthTree = getDepthTree(tree);
	const links = updateYOfTree(depthTree, height, nodePadding, data.links, verticalAlign);

	resolveCollisions(depthTree, height, nodePadding, sort);

	if (verticalAlign === 'justify') {
		let alpha = 1;
		for (let i = 1; i <= iterations; i++) {
			relaxRightToLeft(tree, depthTree, links, (alpha *= 0.99));
			resolveCollisions(depthTree, height, nodePadding, sort);
			relaxLeftToRight(tree, depthTree, links, alpha);
			resolveCollisions(depthTree, height, nodePadding, sort);
		}
	}

	updateYOfLinks(tree, links);

	const nodes: SankeyNodeShape[] = tree.map((node, index) => ({
		x: node.x + left,
		y: node.y + top,
		width: node.dx,
		height: node.dy,
		index,
		payload: node
	}));

	const bands: SankeyLinkShape[] = [];

	links.forEach((link, index) => {
		const sourceNode = tree[link.source];
		const targetNode = tree[link.target];
		if (sourceNode == null || targetNode == null) return;

		const sourceX = sourceNode.x + sourceNode.dx + left;
		const targetX = targetNode.x + left;
		const interpolate = interpolationGenerator(sourceX, targetX);

		// Destructured so the node objects replace the numeric indices rather than intersecting
		// with them, which is what the reference's spread does at runtime.
		const { source: _sourceIndex, target: _targetIndex, ...linkRest } = link;

		bands.push({
			sourceX,
			targetX,
			sourceY: sourceNode.y + link.sy + link.dy / 2 + top,
			targetY: targetNode.y + link.ty + link.dy / 2 + top,
			sourceControlX: interpolate(linkCurvature),
			targetControlX: interpolate(1 - linkCurvature),
			linkWidth: link.dy,
			index,
			payload: { ...linkRest, source: sourceNode, target: targetNode }
		});
	});

	return { nodes, links: bands };
}

/** Sums a node's outgoing flow, falling back to incoming flow for leaf nodes. */
export function getNodeValue(data: SankeyData, nodeName: string): number {
	const nodeIndex = data.nodes.findIndex((node) => node.name === nodeName);
	if (nodeIndex === -1) return 0;

	const outgoing = data.links
		.filter((link) => link.source === nodeIndex)
		.reduce((sum, link) => sum + link.value, 0);
	const incoming = data.links
		.filter((link) => link.target === nodeIndex)
		.reduce((sum, link) => sum + link.value, 0);

	return outgoing > 0 ? outgoing : incoming;
}

/** Whether a node is the selected one or directly linked to it. */
export function isNodeConnected(
	data: SankeyData,
	selectedNode: string | null,
	nodeName: string
): boolean {
	if (selectedNode === null || selectedNode === nodeName) return true;

	const selectedIdx = data.nodes.findIndex((node) => node.name === selectedNode);
	const nodeIdx = data.nodes.findIndex((node) => node.name === nodeName);

	return data.links.some(
		(link) =>
			(link.source === selectedIdx && link.target === nodeIdx) ||
			(link.source === nodeIdx && link.target === selectedIdx)
	);
}
