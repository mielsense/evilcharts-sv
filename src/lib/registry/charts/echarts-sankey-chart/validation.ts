import type { SankeyData } from './types.js';

export const SANKEY_VALIDATION_ERROR_CODE = 'INVALID_SANKEY_DATA' as const;
export const SANKEY_VALIDATION_ERROR_MESSAGE =
	'Sankey data requires integer in-range link endpoints, finite non-negative values, representable aggregate flows and layout scale, and no directed cycles.';

export class SankeyValidationError extends RangeError {
	readonly code = SANKEY_VALIDATION_ERROR_CODE;

	constructor() {
		super(SANKEY_VALIDATION_ERROR_MESSAGE);
		this.name = 'SankeyValidationError';
	}
}

export type SankeyDataAnalysis = {
	topologicalOrder: number[];
	targets: number[][];
	incomingValues: number[];
	outgoingValues: number[];
};

function throwValidationError(): never {
	throw new SankeyValidationError();
}

/** Rejects malformed graphs before derived values, animation depths, or ECharts layout are built. */
export function validateSankeyData(data: SankeyData): SankeyDataAnalysis {
	const targets = data.nodes.map(() => [] as number[]);
	const incomingLinkCounts = data.nodes.map(() => 0);
	const incomingValues = data.nodes.map(() => 0);
	const outgoingValues = data.nodes.map(() => 0);
	let maximumValue = 0;
	let minimumPositiveValue = Number.POSITIVE_INFINITY;

	for (const link of data.links) {
		const hasValidEndpoints =
			Number.isInteger(link.source) &&
			link.source >= 0 &&
			link.source < data.nodes.length &&
			Number.isInteger(link.target) &&
			link.target >= 0 &&
			link.target < data.nodes.length;
		const hasValidValue = Number.isFinite(link.value) && link.value >= 0;

		if (!hasValidEndpoints || !hasValidValue || link.source === link.target) {
			throwValidationError();
		}

		maximumValue = Math.max(maximumValue, link.value);
		if (link.value > 0) minimumPositiveValue = Math.min(minimumPositiveValue, link.value);

		outgoingValues[link.source] += link.value;
		incomingValues[link.target] += link.value;
		if (
			!Number.isFinite(outgoingValues[link.source]) ||
			!Number.isFinite(incomingValues[link.target])
		) {
			throwValidationError();
		}

		targets[link.source].push(link.target);
		incomingLinkCounts[link.target] += 1;
	}

	if (maximumValue > 0 && minimumPositiveValue / maximumValue === 0) {
		throwValidationError();
	}

	const queue: number[] = [];
	for (let nodeIndex = 0; nodeIndex < incomingLinkCounts.length; nodeIndex += 1) {
		if (incomingLinkCounts[nodeIndex] === 0) queue.push(nodeIndex);
	}

	const topologicalOrder: number[] = [];
	for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
		const nodeIndex = queue[queueIndex];
		topologicalOrder.push(nodeIndex);

		for (const target of targets[nodeIndex]) {
			incomingLinkCounts[target] -= 1;
			if (incomingLinkCounts[target] === 0) queue.push(target);
		}
	}

	if (topologicalOrder.length !== data.nodes.length) throwValidationError();

	return { topologicalOrder, targets, incomingValues, outgoingValues };
}

export function getRenderableSankeyData(data: SankeyData): SankeyData {
	try {
		validateSankeyData(data);
		return data;
	} catch (error) {
		if (error instanceof SankeyValidationError) return { nodes: [], links: [] };
		throw error;
	}
}
