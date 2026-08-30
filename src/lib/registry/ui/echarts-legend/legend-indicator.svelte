<script lang="ts">
	import { indicatorBackground } from '../echarts-chart/index.js';
	import type { LegendVariant } from './legend.svelte';

	let {
		variant,
		dataKey,
		colorsCount
	}: { variant: LegendVariant; dataKey: string; colorsCount: number } = $props();

	const background = $derived(indicatorBackground(dataKey, colorsCount));
	const fillStyle = $derived(`background:${background}`);
	const outlineStyle = $derived(
		`${fillStyle};-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask-composite:exclude`
	);
</script>

{#if variant === 'square'}
	<span class="h-2 w-2 shrink-0" style={fillStyle}></span>
{:else if variant === 'circle'}
	<span class="h-2 w-2 shrink-0 rounded-full" style={fillStyle}></span>
{:else if variant === 'circle-outline'}
	<span class="h-2.5 w-2.5 shrink-0 rounded-full p-[1.5px]" style={outlineStyle}></span>
{:else if variant === 'vertical-bar'}
	<span class="h-3 w-1 shrink-0 rounded-[2px]" style={fillStyle}></span>
{:else if variant === 'horizontal-bar'}
	<span class="h-1 w-3 shrink-0 rounded-[2px]" style={fillStyle}></span>
{:else if variant === 'rounded-square-outline'}
	<span class="h-2.5 w-2.5 shrink-0 rounded-[3px] p-[1.5px]" style={outlineStyle}></span>
{:else}
	<span class="h-2 w-2 shrink-0 rounded-[2px]" style={fillStyle}></span>
{/if}
