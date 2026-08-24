<script lang="ts">
	/**
	 * Declares per-sector labels for the <Pie /> it is composed inside. It renders nothing on its
	 * own — the parent <Pie /> reads its props and draws the label over each sector.
	 */
	import { usePieSlots } from './pie-slots.svelte.js';

	let {
		dataKey,
		labelListProps,
		labelProps
	}: {
		dataKey?: string; // data key for the label text — defaults to the pie's value key
		labelListProps?: Record<string, unknown>; // canonical escape hatch, matching the original API
		/** @deprecated Use `labelListProps`. */
		labelProps?: Record<string, unknown>; // escape hatch for raw label attributes
	} = $props();

	const forwardedLabelProps = $derived({ ...(labelProps ?? {}), ...(labelListProps ?? {}) });

	const slots = usePieSlots();
	const token = $props.id();

	$effect.pre(() => {
		slots.registerLabel(token, { dataKey, labelProps: forwardedLabelProps });
		return () => slots.unregisterLabel(token);
	});
</script>
