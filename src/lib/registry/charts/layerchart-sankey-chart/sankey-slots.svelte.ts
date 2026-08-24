import { getContext, setContext } from 'svelte';
import type { LinkVariant, NodeLabelPosition } from './types.js';

const SANKEY_SLOTS_KEY = Symbol('evilcharts.sankey-slots');
const NODE_SLOTS_KEY = Symbol('evilcharts.sankey-node-slots');

export type NodeSlot = {
	radius?: number;
	isClickable?: boolean;
};

export type NodeLabelSlot = {
	position?: NodeLabelPosition;
	showValues?: boolean;
	valueFormatter?: (value: number) => string;
};

export type LinkSlot = {
	variant?: LinkVariant;
	verticalPadding?: number;
};

/**
 * Registry for the chart's `<Node />` and `<Link />` children.
 *
 * The reference reads them with `React.Children.forEach` and hands the props to Recharts' `node` /
 * `link` render props; Svelte cannot inspect a snippet, so each slot registers itself here instead
 * — the config-slot pattern from plans/SPEC.md §4.2. Token-keyed so a remount's stale teardown
 * cannot clear the live slot (DEVIATIONS.md A-3).
 */
export class SankeySlots {
	#nodeToken: string | null = null;
	#linkToken: string | null = null;

	node = $state<NodeSlot | null>(null);
	link = $state<LinkSlot | null>(null);
	/**
	 * The `<NodeLabel />` composed inside the `<Node />`, mirrored up so the root can read it.
	 *
	 * The reference reaches it with a nested `Children.forEach` over `nodeConfig.children`; Svelte
	 * cannot inspect a snippet, so `<Node />` forwards whatever registered into it.
	 */
	nodeLabel = $state<NodeLabelSlot | null>(null);

	registerNode(token: string, slot: NodeSlot) {
		this.#nodeToken = token;
		this.node = slot;
	}

	unregisterNode(token: string) {
		if (this.#nodeToken !== token) return;
		this.#nodeToken = null;
		this.node = null;
	}

	registerLink(token: string, slot: LinkSlot) {
		this.#linkToken = token;
		this.link = slot;
	}

	unregisterLink(token: string) {
		if (this.#linkToken !== token) return;
		this.#linkToken = null;
		this.link = null;
	}
}

/** Registry for the `<NodeLabel />` composed inside a `<Node />`. */
export class NodeSlots {
	#labelToken: string | null = null;

	label = $state<NodeLabelSlot | null>(null);

	registerLabel(token: string, slot: NodeLabelSlot) {
		this.#labelToken = token;
		this.label = slot;
	}

	unregisterLabel(token: string) {
		if (this.#labelToken !== token) return;
		this.#labelToken = null;
		this.label = null;
	}
}

export function setSankeySlotsContext() {
	const slots = new SankeySlots();
	setContext(SANKEY_SLOTS_KEY, slots);
	return slots;
}

export function useSankeySlots(): SankeySlots {
	const slots = getContext<SankeySlots | undefined>(SANKEY_SLOTS_KEY);

	if (!slots) {
		throw new Error('<Node /> and <Link /> must be composed inside an <EvilSankeyChart />');
	}

	return slots;
}

export function setNodeSlotsContext() {
	const slots = new NodeSlots();
	setContext(NODE_SLOTS_KEY, slots);
	return slots;
}

export function useNodeSlots(): NodeSlots {
	const slots = getContext<NodeSlots | undefined>(NODE_SLOTS_KEY);

	if (!slots) {
		throw new Error('<NodeLabel /> must be composed inside a <Node />');
	}

	return slots;
}
