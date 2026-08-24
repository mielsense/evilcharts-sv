<script lang="ts">
	/**
	 * Ported from `evilcharts/src/components/ui/collapsible.tsx` (Base UI `Collapsible.Panel`).
	 *
	 * `keepMounted` is always on here: the reference passes it explicitly at its only call site
	 * (`code-collapsible-wrapper.tsx`), which needs the collapsed content in the DOM so it can be
	 * clipped to `max-h-64`.
	 *
	 * `--collapsible-panel-height` is measured off the panel, as the primitive does, so the
	 * reference's `h-(--collapsible-panel-height)` and `transition-[height]` classes work unchanged
	 * — including a caller overriding the height with `h-full`, which is how the code wrapper keeps
	 * its collapsed preview visible.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$site/lib/utils.js';
	import { useCollapsible } from './collapsible-context.svelte.js';

	let {
		class: className,
		children,
		...rest
	}: { class?: string; children?: Snippet } & Omit<
		HTMLAttributes<HTMLDivElement>,
		'class' | 'children'
	> = $props();

	const collapsible = useCollapsible();

	let panel = $state<HTMLDivElement | null>(null);
	let contentHeight = $state(0);

	$effect(() => {
		const element = panel;
		if (!element) return;
		const measure = () => (contentHeight = element.scrollHeight);
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		measure();
		return () => observer.disconnect();
	});
</script>

<div
	bind:this={panel}
	data-slot="collapsible-panel"
	data-open={collapsible.open ? '' : undefined}
	data-closed={collapsible.open ? undefined : ''}
	class={cn(
		'h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 data-ending-style:h-0 data-starting-style:h-0',
		className
	)}
	style={`--collapsible-panel-height:${collapsible.open ? `${contentHeight}px` : '0px'}`}
	{...rest}
>
	{@render children?.()}
</div>
