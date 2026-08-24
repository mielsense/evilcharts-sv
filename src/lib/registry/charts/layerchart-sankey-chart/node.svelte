<script lang="ts">
	/**
	 * Configures how the sankey nodes render. It is a configuration slot — the root reads its props
	 * and wires them into the node renderer, so it renders nothing itself. Compose a <NodeLabel />
	 * inside it to show labels.
	 */
	import type { Snippet } from 'svelte';
	import { setNodeSlotsContext, useSankeySlots } from './sankey-slots.svelte.js';

	let {
		radius,
		isClickable = false,
		children
	}: {
		radius?: number; // corner radius of node rectangles in pixels
		isClickable?: boolean; // lets nodes be selected by clicking them
		children?: Snippet; // optional <NodeLabel /> composition
	} = $props();

	const slots = useSankeySlots();
	const token = $props.id();

	// The <NodeLabel /> child registers into this…
	const nodeSlots = setNodeSlotsContext();

	$effect.pre(() => {
		slots.registerNode(token, { radius, isClickable });
		return () => slots.unregisterNode(token);
	});

	// …and it is mirrored onto the chart-level slots, which is where the root reads it.
	$effect(() => {
		slots.nodeLabel = nodeSlots.label;
	});
</script>

<!-- Renders nothing: the child only needs to register itself. -->
{@render children?.()}
