<script lang="ts">
	/**
	 * The skeleton sankey shown while the chart is loading. Rendered by the root in place of the real
	 * diagram — a fixed grid of pulsing nodes and links, with the reference's exact coordinates and
	 * per-element delays.
	 */
	import LoadingLink from './loading-link.svelte';
	import LoadingNode from './loading-node.svelte';
	import { LOADING_ANIMATION_DURATION } from '../types.js';

	const nodes = [
		{ x: 30, y: 25, width: 12, height: 65, delay: 0 },
		{ x: 30, y: 110, width: 12, height: 50, delay: 0.3 },
		{ x: 30, y: 180, width: 12, height: 45, delay: 0.15 },
		{ x: 244, y: 20, width: 12, height: 55, delay: 0.45 },
		{ x: 244, y: 95, width: 12, height: 75, delay: 0.6 },
		{ x: 244, y: 190, width: 12, height: 40, delay: 0.25 },
		{ x: 458, y: 35, width: 12, height: 80, delay: 0.5 },
		{ x: 458, y: 135, width: 12, height: 90, delay: 0.1 }
	];

	const links = [
		{ from: 0, to: 3, width: 26, delay: 0.2 },
		{ from: 0, to: 4, width: 18, delay: 0.7 },
		{ from: 1, to: 4, width: 24, delay: 0.4 },
		{ from: 1, to: 5, width: 12, delay: 0.9 },
		{ from: 2, to: 4, width: 16, delay: 0.1 },
		{ from: 2, to: 5, width: 14, delay: 0.55 },
		{ from: 3, to: 6, width: 22, delay: 0.35 },
		{ from: 3, to: 7, width: 18, delay: 0.8 },
		{ from: 4, to: 6, width: 28, delay: 0.05 },
		{ from: 4, to: 7, width: 32, delay: 0.65 },
		{ from: 5, to: 7, width: 16, delay: 0.45 }
	];

	/** A bezier connecting the right edge of one node to the left of another. */
	function getLinkPath(fromIdx: number, toIdx: number) {
		const from = nodes[fromIdx];
		const to = nodes[toIdx];
		const startX = from.x + from.width;
		const startY = from.y + from.height / 2;
		const endX = to.x;
		const endY = to.y + to.height / 2;
		const controlX1 = startX + (endX - startX) * 0.4;
		const controlX2 = startX + (endX - startX) * 0.6;
		return `M${startX},${startY} C${controlX1},${startY} ${controlX2},${endY} ${endX},${endY}`;
	}

	const baseDuration = LOADING_ANIMATION_DURATION / 1000;
</script>

<!--
	The reference renders this into its own `viewBox="0 0 500 250"` overlay, so the coordinates above
	are in that space rather than the chart's.
-->
<svg
	viewBox="0 0 500 250"
	preserveAspectRatio="xMidYMid meet"
	width="100%"
	height="100%"
	class="absolute inset-0"
>
	{#each links as link, index (`${link.from}-${link.to}`)}
		<LoadingLink
			d={getLinkPath(link.from, link.to)}
			width={link.width}
			delay={link.delay}
			duration={baseDuration * (0.8 + (index % 3) * 0.2)}
		/>
	{/each}
	{#each nodes as node, index (`${node.x}-${node.y}`)}
		<LoadingNode
			x={node.x}
			y={node.y}
			width={node.width}
			height={node.height}
			delay={node.delay}
			duration={baseDuration * (0.9 + (index % 4) * 0.1)}
		/>
	{/each}
</svg>
