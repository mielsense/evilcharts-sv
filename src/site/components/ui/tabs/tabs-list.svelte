<script lang="ts">
	/**
	 * Ported from `evilcharts/src/components/ui/tabs.tsx` (Base UI `Tabs.List` + `Tabs.Indicator`).
	 *
	 * The indicator's own class strings are the reference's; the `--active-tab-*` variables it reads
	 * are measured here rather than supplied by the primitive.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$site/lib/utils.js';
	import { useTabs } from './tabs-context.svelte.js';

	let {
		variant = 'default',
		indicatorClassName,
		class: className,
		children,
		...rest
	}: {
		variant?: 'default' | 'underline';
		indicatorClassName?: string;
		class?: string;
		children?: Snippet;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> = $props();

	const tabs = useTabs();

	let list = $state<HTMLDivElement | null>(null);

	/**
	 * Measures the active tab whenever it changes or the list resizes. A `ResizeObserver` on the
	 * list covers both a font swap and the container growing; the tab set itself is static.
	 */
	$effect(() => {
		const element = list;
		if (!element) return;

		const measure = () => {
			const active = element.querySelector<HTMLElement>('[data-slot="tabs-trigger"][data-active]');
			if (!active) {
				tabs.box = null;
				return;
			}
			const listBox = element.getBoundingClientRect();
			const tabBox = active.getBoundingClientRect();
			tabs.box = {
				width: tabBox.width,
				height: tabBox.height,
				left: tabBox.left - listBox.left,
				bottom: listBox.bottom - tabBox.bottom
			};
		};

		// Read the active value so a tab change re-measures.
		void tabs.value;
		measure();

		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	});

	const indicatorStyle = $derived(
		tabs.box
			? `--active-tab-width:${tabs.box.width}px;--active-tab-height:${tabs.box.height}px;` +
					`--active-tab-left:${tabs.box.left}px;--active-tab-bottom:${tabs.box.bottom}px`
			: 'display:none'
	);
</script>

<div
	bind:this={list}
	class={cn(
		'relative z-0 flex w-fit items-center justify-center gap-x-0.5 text-muted-foreground',
		'data-[orientation=vertical]:flex-col',
		variant === 'default'
			? 'rounded-lg bg-muted p-0.5 text-muted-foreground/72'
			: 'data-[orientation=horizontal]:py-1 data-[orientation=vertical]:px-1 *:data-[slot=tabs-trigger]:hover:bg-accent/50',
		className
	)}
	data-slot="tabs-list"
	data-orientation={tabs.orientation}
	role="tablist"
	{...rest}
>
	{@render children?.()}
	<div
		class={cn(
			'absolute bottom-0 left-0 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-(--active-tab-bottom) transition-[width,translate] duration-200 ease-in-out',
			variant === 'underline'
				? 'z-10 bg-primary! data-[orientation=horizontal]:h-px data-[orientation=horizontal]:translate-y-px data-[orientation=vertical]:w-0.5 data-[orientation=vertical]:-translate-x-px'
				: '-z-1 rounded-md bg-background shadow-sm dark:bg-accent',
			indicatorClassName
		)}
		data-slot="tab-indicator"
		data-orientation={tabs.orientation}
		style={indicatorStyle}
	></div>
</div>
