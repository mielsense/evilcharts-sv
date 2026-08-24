<script lang="ts">
	// ---------------------------------------------------------------------------
	// Legend indicator — each variant gets its own branch so future variants
	// can diverge freely in markup & style.
	// ---------------------------------------------------------------------------
	import { getLegendFillStyle, getLegendOutlineStyle } from './styles.js';
	import type { ChartLegendVariant } from './types.js';

	let {
		variant,
		dataKey,
		colorsCount
	}: { variant: ChartLegendVariant; dataKey: string; colorsCount: number } = $props();

	const fillStyle = $derived(getLegendFillStyle(dataKey, colorsCount));
	const outlineStyle = $derived(getLegendOutlineStyle(dataKey, colorsCount));
</script>

{#if variant === 'square'}
	<div class="h-2 w-2 shrink-0" style={fillStyle}></div>
{:else if variant === 'circle'}
	<div class="h-2 w-2 shrink-0 rounded-full" style={fillStyle}></div>
{:else if variant === 'circle-outline'}
	<div class="h-2.5 w-2.5 shrink-0 rounded-full p-[1.5px]" style={outlineStyle}></div>
{:else if variant === 'vertical-bar'}
	<div class="h-3 w-1 shrink-0 rounded-[2px]" style={fillStyle}></div>
{:else if variant === 'horizontal-bar'}
	<div class="h-1 w-3 shrink-0 rounded-[2px]" style={fillStyle}></div>
{:else if variant === 'rounded-square-outline'}
	<div class="h-2.5 w-2.5 shrink-0 rounded-[3px] p-[1.5px]" style={outlineStyle}></div>
{:else}
	<div class="h-2 w-2 shrink-0 rounded-[2px]" style={fillStyle}></div>
{/if}
