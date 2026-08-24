<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';
	import { getPayloadConfigFromPayload } from '../layerchart-chart/payload.js';
	import { useChart } from '../layerchart-chart/chart-context.svelte.js';
	import { colorsCountFor, getIndicatorColorStyle, roundnessMap, variantMap } from './styles.js';
	import type { ChartConfig } from '../layerchart-chart/chart-config.js';
	import type {
		TooltipIndicator,
		TooltipPayloadItem,
		TooltipRoundness,
		TooltipVariant
	} from './types.js';

	type Props = {
		active?: boolean;
		payload?: TooltipPayloadItem[];
		class?: string;
		indicator?: TooltipIndicator;
		hideLabel?: boolean;
		hideIndicator?: boolean;
		label?: unknown;
		labelFormatter?: Snippet<[unknown, TooltipPayloadItem[]]>;
		labelClassName?: string;
		formatter?: Snippet<[TooltipPayloadItem['value'], string, TooltipPayloadItem, number, unknown]>;
		nameKey?: string;
		labelKey?: string;
		selected?: string | null;
		roundness?: TooltipRoundness;
		variant?: TooltipVariant;
	};

	let {
		active,
		payload,
		class: className,
		indicator = 'dot',
		hideLabel = false,
		hideIndicator = false,
		label,
		labelFormatter,
		labelClassName,
		formatter,
		nameKey,
		labelKey,
		selected,
		roundness = 'lg',
		variant = 'default'
	}: Props = $props();

	const { config } = $derived(useChart());

	const labelValue = $derived.by(() => {
		if (hideLabel || !payload?.length) {
			return null;
		}

		const [item] = payload;
		const key = `${labelKey ?? item?.dataKey ?? item?.name ?? 'value'}`;
		const itemConfig = getPayloadConfigFromPayload(config, item, key);

		return !labelKey && typeof label === 'string'
			? (config[label]?.label ?? label)
			: itemConfig?.label;
	});

	const nestLabel = $derived(payload?.length === 1 && indicator !== 'dot');

	type Row = {
		item: TooltipPayloadItem;
		index: number;
		key: string;
		itemConfig: ChartConfig[string] | undefined;
		colorsCount: number;
		isDimmed: boolean;
		/** Resolved here rather than with a declaration tag in the markup — see DEVIATIONS A-6c. */
		icon: ChartConfig[string]['icon'];
	};

	/**
	 * Fully resolved rows.
	 *
	 * Derived as one list rather than with in-markup declarations so a later `selected` change
	 * re-derives every row — the reference recomputes these inline on each React render.
	 */
	const rows = $derived<Row[]>(
		(payload ?? [])
			.filter((item) => item.type !== 'none')
			.map((item, index) => {
				// For pie charts, item.name contains the sector name (e.g., "chrome")
				// For radial charts, the name is in item.payload[nameKey]
				// For other charts, item.name or item.dataKey contains the series name
				const payloadName =
					nameKey && item.payload ? (item.payload as Record<string, unknown>)[nameKey] : undefined;
				const key = `${payloadName ?? item.name ?? item.dataKey ?? 'value'}`;
				const itemConfig = getPayloadConfigFromPayload(config, item, key);

				return {
					item,
					index,
					key,
					itemConfig,
					// Get colors count for this item to determine gradient vs solid
					colorsCount: colorsCountFor(itemConfig),
					isDimmed: selected != null && selected !== item.dataKey,
					icon: itemConfig?.icon
				};
			})
	);
</script>

{#snippet tooltipLabel()}
	{#if !hideLabel && payload?.length}
		{#if labelFormatter}
			<div class={cn('font-medium', labelClassName)}>
				{@render labelFormatter(labelValue, payload)}
			</div>
		{:else if labelValue}
			<div class={cn('font-medium', labelClassName)}>
				{#if typeof labelValue === 'string'}{labelValue}{:else}{@render labelValue()}{/if}
			</div>
		{/if}
	{/if}
{/snippet}

{#if !active || !payload?.length}
	<!-- Empty tooltip - to prevent position getting 0.0 so it doesnt animate tooltip every time from 0.0 origin -->
	<span class="p-4"></span>
{:else}
	<div
		class={cn(
			'grid min-w-32 items-start gap-1.5 border border-border/50 px-2.5 py-1.5 text-xs shadow-xl',
			roundnessMap[roundness],
			variantMap[variant],
			className
		)}
	>
		{#if !nestLabel}{@render tooltipLabel()}{/if}
		<div class="grid gap-1.5">
			{#each rows as row (row.index)}
				<div
					class={cn(
						'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
						indicator === 'dot' && 'items-center',
						row.isDimmed && 'opacity-30'
					)}
				>
					{#if formatter && row.item?.value !== undefined && row.item.name}
						{@render formatter(
							row.item.value,
							row.item.name,
							row.item,
							row.index,
							row.item.payload
						)}
					{:else}
						{#if row.icon}
							{@const Icon = row.icon}
							<Icon />
						{:else if !hideIndicator}
							<div
								class={cn('shrink-0 rounded-[2px]', {
									'h-2.5 w-2.5': indicator === 'dot',
									'w-1': indicator === 'line',
									'w-0 border-[1.5px] border-dashed bg-transparent!': indicator === 'dashed',
									'my-0.5': nestLabel && indicator === 'dashed'
								})}
								style={getIndicatorColorStyle(row.key, row.colorsCount)}
							></div>
						{/if}
						<div
							class={cn(
								'flex flex-1 justify-between gap-4 leading-none',
								nestLabel ? 'items-end' : 'items-center'
							)}
						>
							<div class="grid gap-1.5">
								{#if nestLabel}{@render tooltipLabel()}{/if}
								<span class="text-muted-foreground">
									{#if row.itemConfig?.label}
										{#if typeof row.itemConfig.label === 'string'}
											{row.itemConfig.label}
										{:else}
											{@render row.itemConfig.label()}
										{/if}
									{:else}
										{row.item.name}
									{/if}
								</span>
							</div>
							{#if row.item.value != null}
								<span class="font-mono font-medium text-foreground tabular-nums">
									{typeof row.item.value === 'number'
										? row.item.value.toLocaleString()
										: String(row.item.value)}
								</span>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}
