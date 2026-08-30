<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import type { EChartsCoreOption, EChartsType } from 'echarts/core';
	import { AriaComponent, PolarComponent, TooltipComponent } from 'echarts/components';
	import { BarChart } from 'echarts/charts';
	import * as echarts from 'echarts/core';
	import {
		ChartContainer,
		DEFAULT_ECHARTS_RENDERER,
		EChartsHost,
		LoadingIndicator,
		RegistrationSet,
		resolveColors,
		setEChartsSharedSlotContext,
		type ChartAccessibility,
		type ChartConfig,
		type EChartsRenderer,
		type ResolvedColors
	} from '../../ui/echarts-chart/index.js';
	import { LegendOverlay } from '../../ui/echarts-legend/index.js';
	import Background from './background.svelte';
	import {
		buildRadialOption,
		createRadialLoadingData,
		mergeRadialChartOptions,
		niceCeil,
		radialShimmerStops
	} from './option.js';
	import { setEChartsRadialChartContext } from './radial-chart-context.svelte.js';
	import {
		DEFAULT_BAR_SIZE,
		DEFAULT_CORNER_RADIUS,
		DEFAULT_INNER_RADIUS,
		DEFAULT_OUTER_RADIUS,
		LOADING_ANIMATION_DURATION,
		type BackgroundVariant,
		type LegendRegistration,
		type RadialSelection,
		type RadialVariant,
		type TooltipRegistration
	} from './types.js';

	echarts.use([BarChart, PolarComponent, TooltipComponent, AriaComponent]);

	let {
		data,
		config,
		nameKey,
		class: className,
		renderer = DEFAULT_ECHARTS_RENDERER,
		variant = 'full',
		max,
		innerRadius = DEFAULT_INNER_RADIUS,
		outerRadius = DEFAULT_OUTER_RADIUS,
		defaultSelectedDataKey = null,
		onSelectionChange,
		isLoading = false,
		backgroundVariant,
		chartOptions,
		accessibility,
		initialDimension = { width: 320, height: 200 },
		children
	}: {
		data: Record<string, unknown>[];
		config: ChartConfig;
		nameKey: string;
		class?: string;
		renderer?: EChartsRenderer;
		variant?: RadialVariant;
		max?: number;
		innerRadius?: number | string;
		outerRadius?: number | string;
		defaultSelectedDataKey?: string | null;
		onSelectionChange?: (selection: RadialSelection | null) => void;
		isLoading?: boolean;
		backgroundVariant?: BackgroundVariant;
		chartOptions?: Record<string, unknown>;
		accessibility?: ChartAccessibility;
		initialDimension?: { width: number; height: number };
		children?: Snippet;
	} = $props();

	let container = $state<HTMLDivElement>();
	let themeRevision = $state(0);
	let instance = $state.raw<EChartsType>();
	let introComplete = $state(false);
	let selectedBar = $state<string | null>(untrack(() => defaultSelectedDataKey));
	let resolved = $state.raw<ResolvedColors>({
		series: {},
		tokens: {
			mutedForeground: 'rgba(120, 120, 120, 1)',
			border: 'rgba(120, 120, 120, 0.35)',
			foreground: 'rgba(120, 120, 120, 1)',
			background: 'rgba(0, 0, 0, 1)'
		}
	});
	let loadingData = $state.raw(createRadialLoadingData());

	const chart = setEChartsRadialChartContext();
	const tooltipSlots = new RegistrationSet<TooltipRegistration>();
	const legendSlots = new RegistrationSet<LegendRegistration>();
	setEChartsSharedSlotContext({
		register(slot, token, getter) {
			if (slot === 'tooltip')
				return tooltipSlots.register(token, getter as () => TooltipRegistration);
			if (slot === 'legend') return legendSlots.register(token, getter as () => LegendRegistration);
			return () => {};
		}
	});

	const radialBar = $derived(
		chart.radialBars.first ?? {
			dataKey: '',
			cornerRadius: DEFAULT_CORNER_RADIUS,
			barSize: DEFAULT_BAR_SIZE,
			showBackground: true,
			isClickable: false
		}
	);
	const tooltip = $derived(tooltipSlots.first);
	const legend = $derived(legendSlots.first);
	const categories = $derived(data.map((row) => String(row[nameKey] ?? '')));
	const values = $derived(
		data.map((row) => {
			const value = Number(row[radialBar.dataKey]);
			return Number.isFinite(value) ? value : 0;
		})
	);
	const angleMax = $derived(max != null && max > 0 ? max : niceCeil(Math.max(0, ...values)));

	$effect(() => {
		void themeRevision;
		const host = container;
		const keys = categories;
		if (host) resolved = resolveColors(host, config, keys);
	});

	const option = $derived.by(() => {
		const built = buildRadialOption({
			categories,
			values,
			config,
			radialBar,
			variant,
			innerRadius,
			outerRadius,
			angleMax,
			selectedBar,
			tooltip,
			isLoading,
			loadingData,
			resolved,
			animation: !introComplete,
			reducedMotion: prefersReducedMotion.current
		});
		return mergeRadialChartOptions(built, chartOptions) as EChartsCoreOption;
	});

	$effect(() => {
		if (isLoading) {
			introComplete = false;
			return;
		}
		if (introComplete || !instance || !radialBar.dataKey) return;
		if (prefersReducedMotion.current) {
			introComplete = true;
			return;
		}
		const timer = window.setTimeout(() => (introComplete = true), 1000);
		return () => window.clearTimeout(timer);
	});

	function select(name: string) {
		if (!radialBar.isClickable && !legend?.isClickable) return;
		selectedBar = selectedBar === name ? null : name;
		const index = categories.indexOf(selectedBar ?? '');
		onSelectionChange?.(
			selectedBar === null
				? null
				: {
						dataKey: selectedBar,
						value: values[index] ?? 0
					}
		);
	}

	const events = $derived({
		click: (params: unknown) => {
			if (!radialBar.isClickable || !params || typeof params !== 'object') return;
			const item = params as { seriesId?: string; dataIndex?: number };
			if (item.seriesId !== 'radial-bars' || typeof item.dataIndex !== 'number') return;
			const name = categories[item.dataIndex];
			if (name !== undefined) select(name);
		}
	});

	$effect(() => {
		const chartInstance = instance;
		const defaultIndex = tooltip?.defaultIndex;
		if (!chartInstance || isLoading || defaultIndex === undefined) return;
		queueMicrotask(() => {
			if (!chartInstance.isDisposed())
				chartInstance.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: defaultIndex });
		});
	});

	$effect(() => {
		const chartInstance = instance;
		if (!chartInstance || !isLoading || prefersReducedMotion.current) return;
		let frame = 0;
		let lastPhase = 0;
		const start = performance.now();
		const tick = (now: number) => {
			const phase = ((now - start) / LOADING_ANIMATION_DURATION) % 1;
			if (phase < lastPhase) loadingData = createRadialLoadingData();
			lastPhase = phase;
			const width = chartInstance.getWidth();
			const height = chartInstance.getHeight();
			if (width > 0 && height > 0) {
				const maxT = (width + height) / (2 * width);
				const center = phase * (maxT + 0.4) - 0.2;
				chartInstance.setOption(
					{
						series: [
							{
								id: '__loading',
								data: loadingData,
								itemStyle: {
									color: new echarts.graphic.LinearGradient(
										0,
										0,
										width,
										width,
										radialShimmerStops(center, resolved.tokens.foreground),
										true
									)
								}
							}
						]
					},
					{ silent: true, lazyUpdate: true }
				);
			}
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});

	const legendStyle = $derived(
		legend?.verticalAlign === 'middle'
			? 'position:absolute;left:16px;right:16px;top:50%;transform:translateY(-50%);z-index:20;gap:12px;flex-wrap:wrap;'
			: 'padding:8px 16px;gap:12px;flex-wrap:wrap;'
	);
</script>

{#snippet overlay()}
	<LoadingIndicator {isLoading} />
{/snippet}

<ChartContainer
	{config}
	{accessibility}
	{overlay}
	{initialDimension}
	bind:element={container}
	bind:themeRevision
	aria-busy={isLoading}
	class={className}
>
	{@render children?.()}
	{#if legend && legend.verticalAlign === 'top' && !isLoading}
		<LegendOverlay
			seriesKeys={categories}
			{config}
			variant={legend.variant}
			align={legend.align}
			selectedKey={selectedBar}
			hoveredKey={null}
			isClickable={legend.isClickable}
			onToggle={select}
			style={legendStyle}
		/>
	{/if}
	<div class="relative min-h-0 w-full flex-1">
		{#if backgroundVariant}<Background variant={backgroundVariant} />{/if}
		{#if radialBar.dataKey}
			<EChartsHost {option} {renderer} {events} bind:instance class="z-10" />
		{/if}
		{#if legend && legend.verticalAlign === 'middle' && !isLoading}
			<LegendOverlay
				seriesKeys={categories}
				{config}
				variant={legend.variant}
				align={legend.align}
				selectedKey={selectedBar}
				hoveredKey={null}
				isClickable={legend.isClickable}
				onToggle={select}
				style={legendStyle}
			/>
		{/if}
	</div>
	{#if legend && legend.verticalAlign === 'bottom' && !isLoading}
		<LegendOverlay
			seriesKeys={categories}
			{config}
			variant={legend.variant}
			align={legend.align}
			selectedKey={selectedBar}
			hoveredKey={null}
			isClickable={legend.isClickable}
			onToggle={select}
			style={legendStyle}
		/>
	{/if}
	{#if radialBar.isClickable}
		<div class="sr-only" aria-label="Chart values">
			{#each categories as name, index (name)}
				<button type="button" aria-pressed={selectedBar === name} onclick={() => select(name)}
					>{name}: {values[index]}</button
				>
			{/each}
		</div>
	{/if}
</ChartContainer>
