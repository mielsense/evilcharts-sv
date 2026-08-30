<script lang="ts">
	import type { ChartConfig } from '../echarts-chart/index.js';
	import { getColorsCount } from '../echarts-chart/index.js';
	import LegendIndicator from './legend-indicator.svelte';
	import type { LegendVariant } from './legend.svelte';

	let {
		seriesKeys,
		config,
		variant,
		align,
		selectedKey,
		hoveredKey,
		isClickable,
		onToggle,
		style
	}: {
		seriesKeys: string[];
		config: ChartConfig;
		variant: LegendVariant;
		align: 'left' | 'center' | 'right';
		selectedKey: string | null;
		hoveredKey: string | null;
		isClickable: boolean;
		onToggle: (key: string) => void;
		style?: string;
	} = $props();

	const justify = $derived(
		align === 'left' ? 'justify-start' : align === 'center' ? 'justify-center' : 'justify-end'
	);
	const entries = $derived(
		seriesKeys.map((key) => ({
			key,
			item: config[key],
			colorsCount: getColorsCount(config[key] ?? {}),
			selected:
				(selectedKey === null || selectedKey === key) &&
				(hoveredKey === null || hoveredKey === key)
		}))
	);
</script>

<div {style} class={['pointer-events-auto flex items-center gap-4 select-none', justify]}>
	{#each entries as entry (entry.key)}
		<button
			type="button"
			disabled={!isClickable}
			class={[
				'flex appearance-none items-center gap-1.5 border-0 bg-transparent p-0 text-inherit transition-opacity',
				!entry.selected && 'opacity-30',
				isClickable ? 'cursor-pointer' : 'cursor-default'
			]}
			onclick={() => onToggle(entry.key)}
		>
			<LegendIndicator {variant} dataKey={entry.key} colorsCount={entry.colorsCount} />
			{#if typeof entry.item?.label === 'function'}
				{@render entry.item.label()}
			{:else}
				{entry.item?.label ?? entry.key}
			{/if}
		</button>
	{/each}
</div>

