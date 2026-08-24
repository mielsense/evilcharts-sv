<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/kbd.tsx`. */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$site/lib/utils.js';

	let {
		class: className,
		children,
		...rest
	}: { class?: string; children?: Snippet } & Omit<
		HTMLAttributes<HTMLElement>,
		'class' | 'children'
	> = $props();
</script>

<kbd data-slot="kbd-group" class={cn('inline-flex items-center gap-1', className)} {...rest}
	>{@render children?.()}</kbd
>
