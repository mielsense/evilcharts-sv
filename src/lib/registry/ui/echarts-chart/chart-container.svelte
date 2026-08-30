<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import ChartStyle from './chart-style.svelte';
	import { validateChartConfigColors, type ChartAccessibility, type ChartConfig } from './types.js';

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		config: ChartConfig;
		children?: Snippet;
		footer?: Snippet;
		initialDimension?: { width: number; height: number };
		dimension?: { width: number; height: number };
		element?: HTMLDivElement;
		themeRevision?: number;
		accessibility?: ChartAccessibility;
	};

	let {
		id,
		config,
		children,
		footer,
		initialDimension = { width: 320, height: 200 },
		dimension = $bindable(),
		element = $bindable(),
		themeRevision = $bindable(0),
		accessibility,
		class: className,
		...restProps
	}: Props = $props();

	const uniqueId = $props.id();
	const chartId = $derived(`chart-${id ?? uniqueId}`);
	const descriptionId = $derived(`${chartId}-description`);
	const describedBy = $derived(
		[accessibility?.description ? descriptionId : undefined, accessibility?.describedBy]
			.filter(Boolean)
			.join(' ') || undefined
	);
	let measuredWidth = $state(0);
	let measuredHeight = $state(0);
	const resolvedDimension = $derived(
		measuredWidth > 0 && measuredHeight > 0
			? { width: measuredWidth, height: measuredHeight }
			: initialDimension
	);

	$effect(() => {
		dimension = resolvedDimension;
	});

	$effect.pre(() => validateChartConfigColors(config));

	function observeTheme(_node: HTMLElement) {
		const observer = new MutationObserver(() => {
			themeRevision += 1;
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class', 'style']
		});
		return () => observer.disconnect();
	}
</script>

<div
	{@attach observeTheme}
	bind:this={element}
	data-slot="chart"
	data-chart={chartId}
	role={accessibility ? 'group' : undefined}
	aria-label={accessibility?.label}
	aria-labelledby={accessibility?.labelledBy}
	aria-describedby={describedBy}
	class={cn(
		'relative flex min-h-0 w-full flex-1 flex-col justify-center text-xs',
		!footer && 'aspect-video',
		className
	)}
	{...restProps}
>
	{#if accessibility?.description}
		<span id={descriptionId} class="sr-only">{accessibility.description}</span>
	{/if}
	<ChartStyle id={chartId} {config} />
	<div
		class="relative flex min-h-0 w-full flex-1 flex-col"
		bind:clientWidth={measuredWidth}
		bind:clientHeight={measuredHeight}
	>
		{@render children?.()}
	</div>
	{@render footer?.()}
</div>
