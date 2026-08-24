<script lang="ts">
	/**
	 * Renders a single sankey node rectangle, plus its optional label and value. The root draws one
	 * of these per node, configured from the composed <Node />.
	 */
	import type { Snippet } from 'svelte';
	import { isNodeConnected, type SankeyNodeShape } from './layout.js';
	import { useSankeyChart } from './sankey-chart-context.svelte.js';
	import type { NodeLabelSlot, NodeSlot } from './sankey-slots.svelte.js';

	let {
		shape,
		nodeConfig,
		label,
		onhover,
		onleave
	}: {
		shape: SankeyNodeShape;
		nodeConfig: NodeSlot | null;
		label: NodeLabelSlot | null;
		onhover: (event: PointerEvent) => void;
		onleave: () => void;
	} = $props();

	const chart = useSankeyChart();

	const radius = $derived(nodeConfig?.radius ?? 0);
	const isClickable = $derived(nodeConfig?.isClickable ?? false);

	const nodeName = $derived(shape.payload.name);
	const nodeValue = $derived(shape.payload.value);
	/** Optional per-node icon, as the reference reads off the data row. */
	const nodeIcon = $derived(shape.payload.icon as Snippet | undefined);

	const isHighlighted = $derived(isNodeConnected(chart.data, chart.selectedNode, nodeName));
	const hasConfigColor = $derived(nodeName in chart.config);
	const configLabel = $derived(chart.config[nodeName]?.label ?? nodeName);
	const dimmed = $derived(isClickable && !isHighlighted);

	const valueFormatter = $derived(
		label?.valueFormatter ?? ((value: number) => value.toLocaleString())
	);
	const showValues = $derived(label?.showValues ?? false);

	const labelX = $derived(shape.x + shape.width / 2);
	const labelY = $derived(showValues ? shape.y + shape.height / 2 - 8 : shape.y + shape.height / 2);
	const valueY = $derived(shape.y + shape.height / 2 + 8);
	const outsideLabelX = $derived(shape.x + shape.width + 8);
	const outsideLabelY = $derived(shape.y + shape.height / 2);

	function select() {
		if (!isClickable) return;
		// Clicking the selected node clears the selection, otherwise selects it
		chart.selectNode(chart.selectedNode === nodeName ? null : nodeName);
	}

	function selectFromKeyboard(event: KeyboardEvent) {
		if (!isClickable || (event.key !== 'Enter' && event.key !== ' ')) return;
		event.preventDefault();
		select();
	}
</script>

{#snippet nodeShape()}
	<rect
		x={shape.x}
		y={shape.y}
		width={shape.width}
		height={shape.height}
		rx={radius}
		ry={radius}
		fill={hasConfigColor ? `url(#${chart.chartId}-sankey-colors-${nodeName})` : 'currentColor'}
		fill-opacity={dimmed ? 0.15 : 0.9}
		class={['transition-opacity duration-200', isClickable && 'cursor-pointer']
			.filter(Boolean)
			.join(' ')}
		onclick={select}
		onpointerenter={onhover}
		onpointermove={onhover}
		onpointerleave={onleave}
		role="presentation"
	/>

	{#if label?.position === 'inside'}
		<!-- A translucent plate behind the label so it reads against the node's own colour. -->
		<rect
			x={shape.x + 1}
			y={shape.y + 1}
			width={shape.width - 2}
			height={shape.height - 2}
			rx={Math.max(0, radius - 1)}
			ry={Math.max(0, radius - 1)}
			opacity={dimmed ? 0.3 : 1}
			class="pointer-events-none fill-white/50 transition-opacity duration-200 dark:fill-black/60"
		/>
		{#if nodeIcon}
			<foreignObject
				x={labelX - 8}
				y={labelY - 30}
				width={16}
				height={16}
				opacity={dimmed ? 0.3 : 1}
				class="pointer-events-none transition-opacity duration-200"
			>
				<div class="flex items-center justify-center text-foreground/80 dark:text-white/80">
					{@render nodeIcon()}
				</div>
			</foreignObject>
		{/if}
		<text
			x={labelX}
			y={nodeIcon ? labelY - 4 : labelY}
			text-anchor="middle"
			dominant-baseline="middle"
			class="pointer-events-none fill-foreground text-[10px] font-medium transition-opacity duration-200 dark:fill-white"
			opacity={dimmed ? 0.3 : 1}
		>
			{#if typeof configLabel === 'string'}{configLabel}{:else}{@render configLabel()}{/if}
		</text>
		{#if showValues}
			<text
				x={labelX}
				y={valueY}
				text-anchor="middle"
				dominant-baseline="middle"
				class="pointer-events-none fill-foreground/60 font-mono text-xs font-medium tabular-nums transition-opacity duration-200 dark:fill-white"
				opacity={dimmed ? 0.3 : 0.6}
			>
				{valueFormatter(nodeValue)}
			</text>
		{/if}
	{/if}

	{#if label?.position === 'outside'}
		<text
			x={outsideLabelX}
			y={outsideLabelY - (showValues ? 8 : 0)}
			text-anchor="start"
			dominant-baseline="middle"
			class="pointer-events-none fill-foreground text-xs"
		>
			{#if typeof configLabel === 'string'}{configLabel}{:else}{@render configLabel()}{/if}
		</text>
		{#if showValues}
			<text
				x={outsideLabelX}
				y={outsideLabelY + 8}
				text-anchor="start"
				dominant-baseline="middle"
				opacity={0.5}
				class="pointer-events-none fill-foreground font-mono text-xs tabular-nums dark:fill-white"
			>
				{valueFormatter(nodeValue)}
			</text>
		{/if}
	{/if}
{/snippet}

{#if isClickable}
	<g
		role="button"
		tabindex="0"
		aria-label={`${nodeName}: ${valueFormatter(nodeValue)}`}
		aria-pressed={chart.selectedNode === nodeName}
		onkeydown={selectFromKeyboard}
	>
		{@render nodeShape()}
	</g>
{:else}
	<g>{@render nodeShape()}</g>
{/if}
