<script lang="ts">
	/**
	 * Ported from `evilcharts/src/components/ui/dropdown-menu.tsx` (Base UI `Menu.Root`).
	 *
	 * bits-ui's `DropdownMenu` stands in for Base UI's `Menu`; the class strings and `data-slot`
	 * values are the reference's. Only the parts the docs actually mount are ported — root, trigger,
	 * content and item — as the reference's checkbox/radio/submenu parts have no call site here.
	 * See plans/DEVIATIONS.md D-2.
	 */
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	let { open = $bindable(false), children }: { open?: boolean; children?: Snippet } = $props();
</script>

<DropdownMenuPrimitive.Root bind:open>
	{@render children?.()}
</DropdownMenuPrimitive.Root>
