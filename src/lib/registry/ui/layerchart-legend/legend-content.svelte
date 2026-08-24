<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { getColorsCount } from '../layerchart-chart/colors.js';
	import { getPayloadConfigFromPayload } from '../layerchart-chart/payload.js';
	import { useChart } from '../layerchart-chart/chart-context.svelte.js';
	import LegendIndicator from './legend-indicator.svelte';
	import type { ChartConfig } from '../layerchart-chart/chart-config.js';
	import type {
		ChartLegendVariant,
		LegendAlign,
		LegendPayloadItem,
		LegendVerticalAlign
	} from './types.js';

	type Props = {
		class?: string;
		hideIcon?: boolean;
		nameKey?: string;
		payload?: LegendPayloadItem[];
		verticalAlign?: LegendVerticalAlign;
		align?: LegendAlign;
		selected?: string | null;
		isClickable?: boolean;
		onSelectChange?: (selected: string | null) => void;
		variant?: ChartLegendVariant;
	};

	let {
		class: className,
		hideIcon = false,
		nameKey,
		payload,
		verticalAlign,
		align = 'right',
		selected,
		isClickable,
		onSelectChange,
		variant = 'rounded-square'
	}: Props = $props();

	const { config } = $derived(useChart());

	type Entry = {
		key: string;
		itemConfig: ChartConfig[string] | undefined;
		colorsCount: number;
		isSelected: boolean;
		/** Resolved here rather than with a declaration tag in the markup — see DEVIATIONS A-6c. */
		icon: ChartConfig[string]['icon'];
	};

	/**
	 * Fully resolved entries.
	 *
	 * Everything each row needs is derived here rather than with in-markup declarations, so a later
	 * `selected` change re-derives the whole list — the reference recomputes these inline on every
	 * React render.
	 */
	/**
	 * Recharts' `<Legend>` defaults to `itemSorter="value"`, so its entries come out ordered by
	 * series name rather than in config order — a composed chart of `revenue` + `profit` lists
	 * "Profit" first, and a pie of browsers lists them alphabetically. The comparison matches
	 * lodash's `compareAscending`, which is what `sortBy` uses: plain `<` on the raw value, with
	 * anything missing sorted last. (Its `<Tooltip itemSorter>` only reaches the *default* tooltip
	 * content, so tooltip rows stay in data order — the reference behaves the same way.)
	 */
	function byValueAscending(a: LegendPayloadItem, b: LegendPayloadItem) {
		const left = a.value;
		const right = b.value;
		if (left === right) return 0;
		if (left === undefined) return 1;
		if (right === undefined) return -1;
		return left < right ? -1 : 1;
	}

	const entries = $derived<Entry[]>(
		(payload ?? [])
			.filter((item) => item.type !== 'none')
			.toSorted(byValueAscending)
			.map((item) => {
				// For pie charts, item.value contains the sector name (e.g., "chrome")
				// For radial charts, the name is in item.payload[nameKey]
				// For other charts, item.dataKey contains the series name (e.g., "desktop")
				const payloadName =
					nameKey && item.payload ? (item.payload as Record<string, unknown>)[nameKey] : undefined;
				const key = `${payloadName ?? item.value ?? item.dataKey ?? 'value'}`;
				const itemConfig = getPayloadConfigFromPayload(config, item, key);

				return {
					key,
					itemConfig,
					// Get colors count for this item to determine gradient vs solid
					colorsCount: itemConfig ? getColorsCount(itemConfig) : 1,
					isSelected: selected === null || selected === undefined || selected === key,
					icon: itemConfig?.icon
				};
			})
	);

	function entryClass(isSelected: boolean) {
		return cn(
			'[&>svg]:text-muted-foreground flex items-center gap-1.5 transition-opacity [&>svg]:h-3 [&>svg]:w-3',
			!isSelected && 'opacity-30',
			isClickable && 'cursor-pointer'
		);
	}

	function select(key: string) {
		if (!isClickable) return;

		onSelectChange?.(selected === key ? null : key);
	}
</script>

{#snippet indicator(entry: Entry)}
	{#if entry.icon && !hideIcon}
		{const Icon = entry.icon}
		<Icon />
	{:else}
		<LegendIndicator {variant} dataKey={entry.key} colorsCount={entry.colorsCount} />
	{/if}
	{#if entry.itemConfig?.label}
		{#if typeof entry.itemConfig.label === 'string'}
			{entry.itemConfig.label}
		{:else}
			{@render entry.itemConfig.label()}
		{/if}
	{/if}
{/snippet}

{#if entries.length}
	<div
		class={cn(
			'relative z-10 flex items-center gap-4 select-none',
			align === 'left' && 'justify-start',
			align === 'center' && 'justify-center',
			align === 'right' && 'justify-end',
			verticalAlign === 'top' && 'pb-4',
			verticalAlign === 'bottom' && 'pt-4',
			className
		)}
	>
		{#each entries as entry (entry.key)}
			{#if isClickable}
				<!-- The reference makes the entry clickable with a bare onClick. Keyboard support is
				     added here without changing the rendered class list. -->
				<button
					type="button"
					class={entryClass(entry.isSelected)}
					onclick={() => select(entry.key)}
				>
					{@render indicator(entry)}
				</button>
			{:else}
				<div class={entryClass(entry.isSelected)}>
					{@render indicator(entry)}
				</div>
			{/if}
		{/each}
	</div>
{/if}
