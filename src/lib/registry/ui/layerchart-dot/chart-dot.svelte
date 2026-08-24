<script lang="ts">
	// The reference wraps each variant in `React.memo`; Svelte's fine-grained updates make that
	// unnecessary, so the memo boundaries are dropped and nothing else changes.
	import ColoredBorderDot from './colored-border-dot.svelte';
	import DefaultDot from './default-dot.svelte';
	import PrimaryBorderDot from './primary-border-dot.svelte';
	import type { ChartDotProps } from './types.js';

	let {
		cx,
		cy,
		dataKey,
		chartId,
		class: className,
		fillOpacity = 1,
		type = 'default',
		maskId,
		gradientX = 0,
		gradientWidth = '100%'
	}: ChartDotProps = $props();

	const dotId = $props.id();
	const gradientUrl = $derived(`url(#${chartId}-colors-${String(dataKey)})`);
</script>

{#if cx !== undefined && cy !== undefined}
	{#if type === 'border'}
		<PrimaryBorderDot
			{cx}
			{cy}
			{dotId}
			{fillOpacity}
			{gradientUrl}
			class={className}
			{maskId}
			{gradientX}
			{gradientWidth}
		/>
	{:else if type === 'colored-border'}
		<ColoredBorderDot
			{cx}
			{cy}
			{dotId}
			{fillOpacity}
			{gradientUrl}
			class={className}
			{maskId}
			{gradientX}
			{gradientWidth}
		/>
	{:else}
		<DefaultDot
			{cx}
			{cy}
			{dotId}
			{fillOpacity}
			{gradientUrl}
			class={className}
			{maskId}
			{gradientX}
			{gradientWidth}
		/>
	{/if}
{/if}
