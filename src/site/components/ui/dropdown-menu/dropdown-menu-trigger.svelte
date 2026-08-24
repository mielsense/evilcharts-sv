<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/dropdown-menu.tsx`. */
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	let {
		children,
		child
	}: {
		children?: Snippet;
		/** The reference's `render={<Button …/>}` escape hatch. */
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();
</script>

<DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {child}>
	{@render children?.()}
</DropdownMenuPrimitive.Trigger>
