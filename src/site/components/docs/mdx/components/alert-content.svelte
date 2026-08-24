<script lang="ts">
	/** `AlertContent` from `evilcharts/src/components/docs/mdx/components/alert.tsx`. */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$site/lib/utils.js';
	import { alertContentVariants, type AlertVariant } from './alert-variants.js';

	let {
		class: className,
		variant = 'default',
		children,
		...rest
	}: { class?: string; variant?: AlertVariant; children?: Snippet } & Omit<
		HTMLAttributes<HTMLDivElement>,
		'class' | 'children'
	> = $props();
</script>

<div
	data-slot="alert-description"
	class={cn(alertContentVariants({ variant }), className)}
	{...rest}
>
	{@render children?.()}
</div>
