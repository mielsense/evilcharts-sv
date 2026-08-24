<script lang="ts">
	/**
	 * Declares labels for the <Node /> it is composed inside. Like <Node />, it is a configuration
	 * slot and renders nothing on its own.
	 */
	import { useNodeSlots } from './sankey-slots.svelte.js';
	import type { NodeLabelPosition } from './types.js';

	let {
		position,
		showValues = false,
		valueFormatter
	}: {
		position?: NodeLabelPosition; // places labels inside or beside the nodes
		showValues?: boolean; // appends each node's total flow value
		valueFormatter?: (value: number) => string; // formats node values when shown
	} = $props();

	const slots = useNodeSlots();
	const token = $props.id();

	$effect.pre(() => {
		slots.registerLabel(token, { position, showValues, valueFormatter });
		return () => slots.unregisterLabel(token);
	});
</script>
