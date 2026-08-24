<script lang="ts">
	/**
	 * Configures how the sankey links render. Like <Node />, it is a configuration slot read by the
	 * root and renders nothing itself. The `variant` controls how each link band is coloured.
	 */
	import { useSankeySlots } from './sankey-slots.svelte.js';
	import type { LinkVariant } from './types.js';

	let {
		variant,
		verticalPadding = 0
	}: {
		variant?: LinkVariant; // colouring strategy for the link bands
		verticalPadding?: number; // shrinks link width where it meets a node
	} = $props();

	const slots = useSankeySlots();
	const token = $props.id();

	$effect.pre(() => {
		slots.registerLink(token, { variant, verticalPadding });
		return () => slots.unregisterLink(token);
	});
</script>
