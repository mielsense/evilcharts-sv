<script lang="ts">
	/**
	 * Ported from `evilcharts/src/components/ui/sheet.tsx` (Base UI `Dialog.Root`), on bits-ui's
	 * `Dialog`. Only the parts the sidebar mounts are ported: root, content, header, title and
	 * description.
	 */
	import { Dialog as SheetPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		onOpenChange,
		children
	}: { open?: boolean; onOpenChange?: (open: boolean) => void; children?: Snippet } = $props();
</script>

<SheetPrimitive.Root bind:open {onOpenChange}>
	{@render children?.()}
</SheetPrimitive.Root>
