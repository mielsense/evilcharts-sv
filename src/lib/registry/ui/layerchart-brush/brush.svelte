<script lang="ts">
	import { useBrushSlot } from './brush-slot.svelte.js';
	import type { BrushProps } from './types.js';

	let { height, formatLabel, onChange }: BrushProps = $props();

	const registry = useBrushSlot();
	const token = $props.id();

	// Config-only slot: renders nothing, its presence turns the footer on.
	$effect.pre(() => {
		registry.register(token, { height, formatLabel, onChange });
		return () => registry.unregister(token);
	});
</script>
