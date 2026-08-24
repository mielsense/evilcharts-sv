<script lang="ts">
	/**
	 * Renders a single sankey link band, coloured by the composed <Link /> variant. Highlights the
	 * bands connected to the selected node and dims the rest.
	 */
	import LinkGradient from './defs/link-gradient.svelte';
	import LinkStrokeGradient from './defs/link-stroke-gradient.svelte';
	import type { SankeyLinkShape } from './layout.js';
	import { useSankeyChart } from './sankey-chart-context.svelte.js';
	import type { LinkSlot } from './sankey-slots.svelte.js';
	import { getLinkFill, linkAreaPath } from './types.js';

	let {
		shape,
		linkConfig,
		onhover,
		onleave
	}: {
		shape: SankeyLinkShape;
		linkConfig: LinkSlot | null;
		onhover: (event: PointerEvent) => void;
		onleave: () => void;
	} = $props();

	const chart = useSankeyChart();

	const variant = $derived(linkConfig?.variant ?? 'gradient');
	const verticalPadding = $derived(linkConfig?.verticalPadding ?? 0);

	const sourceName = $derived(shape.payload.source.name);
	const targetName = $derived(shape.payload.target.name);

	const isConnected = $derived(
		chart.selectedNode === null ||
			chart.selectedNode === sourceName ||
			chart.selectedNode === targetName
	);

	const halfWidth = $derived(Math.max(1, shape.linkWidth - verticalPadding) / 2);
	const path = $derived(
		linkAreaPath({
			sourceX: shape.sourceX,
			sourceY: shape.sourceY,
			targetX: shape.targetX,
			targetY: shape.targetY,
			sourceControlX: shape.sourceControlX,
			targetControlX: shape.targetControlX,
			halfWidth
		})
	);
</script>

<g>
	<defs>
		{#if variant === 'gradient'}
			<LinkGradient
				chartId={chart.chartId}
				index={shape.index}
				config={chart.config}
				{sourceName}
				{targetName}
			/>
		{/if}
		<LinkStrokeGradient chartId={chart.chartId} index={shape.index} />
	</defs>
	<path
		d={path}
		fill={getLinkFill(variant, chart.chartId, shape.index, chart.config, sourceName, targetName)}
		fill-opacity={isConnected ? 0.4 : 0.1}
		stroke={chart.selectedNode !== null && isConnected
			? `url(#${chart.chartId}-link-stroke-${shape.index})`
			: 'none'}
		stroke-width={1}
		stroke-opacity={1}
		class="transition-opacity duration-200"
		onpointerenter={onhover}
		onpointermove={onhover}
		onpointerleave={onleave}
		role="presentation"
	/>
</g>
