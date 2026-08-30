<script lang="ts" generics="TData extends Record<string, unknown>">
	import { prefersReducedMotion } from 'svelte/motion';
	import { untrack, type Snippet } from 'svelte';
	import type { EChartsCoreOption, EChartsType } from 'echarts/core';
	import { AriaComponent, RadarComponent, TooltipComponent } from 'echarts/components';
	import { RadarChart } from 'echarts/charts';
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
	import type { DitherVariant, RenderStyle } from '../../ui/echarts-dither/index.js';
	import { LegendOverlay } from '../../ui/echarts-legend/index.js';
	import { setEChartsRadarChartContext } from './radar-chart-context.svelte.js';
	import { buildRadarOption, createRadarLoadingData, createRadarShimmerStops } from './option.js';
	import {
		LOADING_ANIMATION_DURATION,
		LOADING_DEFAULT_POINTS,
		REVEAL_DURATION,
		type DitherBloom,
		type LegendRegistration,
		type TooltipRegistration
	} from './types.js';

	echarts.use([RadarChart, RadarComponent, TooltipComponent, AriaComponent]);

	let {
		data,
		config,
		class: className,
		renderer = DEFAULT_ECHARTS_RENDERER,
		animation = true,
		renderStyle = 'native',
		ditherVariant = 'gradient',
		ditherCellSize = 2,
		bloom = 'off',
		defaultSelectedDataKey = null,
		onSelectionChange,
		isLoading = false,
		loadingPoints = LOADING_DEFAULT_POINTS,
		chartOptions,
		accessibility,
		children
	}: {
		data: TData[];
		config: ChartConfig;
		class?: string;
		renderer?: EChartsRenderer;
		animation?: boolean;
		renderStyle?: RenderStyle;
		ditherVariant?: DitherVariant;
		ditherCellSize?: number;
		bloom?: DitherBloom;
		defaultSelectedDataKey?: string | null;
		onSelectionChange?: (key: string | null) => void;
		isLoading?: boolean;
		loadingPoints?: number;
		chartOptions?: Record<string, unknown>;
		accessibility?: ChartAccessibility;
		children?: Snippet;
	} = $props();

	let container = $state<HTMLDivElement>();
	let instance = $state.raw<EChartsType>();
	let themeRevision = $state(0);
	let dimension = $state({ width: 320, height: 200 });
	let selectedDataKey = $state<string | null>(untrack(() => defaultSelectedDataKey));
	let hasRevealed = false;
	let resolved = $state.raw<ResolvedColors>({
		series: {},
		tokens: {
			mutedForeground: 'rgba(120, 120, 120, 1)',
			border: 'rgba(120, 120, 120, 0.35)',
			foreground: 'rgba(120, 120, 120, 1)',
			background: 'rgba(0, 0, 0, 1)'
		}
	});

	const chart = setEChartsRadarChartContext();
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

	const radars = $derived(chart.radars.values);
	const grid = $derived(chart.grids.first);
	const angleAxis = $derived(chart.angleAxes.first);
	const radiusAxis = $derived(Boolean(chart.radiusAxes.first));
	const tooltip = $derived(tooltipSlots.first);
	const legend = $derived(legendSlots.first);
	const seriesKeys = $derived(radars.map((radar) => radar.dataKey));
	const loadingData = $derived(createRadarLoadingData(loadingPoints));

	$effect(() => {
		void themeRevision;
		const host = container;
		const keys = seriesKeys;
		if (host) resolved = resolveColors(host, config, keys);
	});

	const fullOption = $derived.by(() => {
		const built = buildRadarOption({
			data: data as Record<string, unknown>[],
			config,
			radars,
			angleAxis,
			radiusAxis,
			grid,
			tooltip,
			legend,
			selectedDataKey,
			resolved,
			animation,
			reducedMotion: prefersReducedMotion.current,
			loadingPoints,
			loadingData,
			isLoading,
			renderStyle,
			ditherVariant,
			ditherCellSize,
			bloom,
			rendererSize: dimension
		});
		return {
			...(chartOptions ? { ...built, ...chartOptions } : built),
			animation: false,
			animationDurationUpdate: 0
		} as EChartsCoreOption;
	});

	type RevealSeries = {
		id?: string;
		data?: { value?: number[] }[];
	};

	const option = $derived.by(() => {
		if (isLoading || hasRevealed || !animation || prefersReducedMotion.current) return fullOption;
		const series = (fullOption.series as unknown as RevealSeries[] | undefined) ?? [];
		return {
			...fullOption,
			series: series.map((item) => ({
				...item,
				data: [{ value: (item.data?.[0]?.value ?? []).map(() => 0) }]
			}))
		} as EChartsCoreOption;
	});

	function selectSeries(key: string | null) {
		selectedDataKey = key;
		onSelectionChange?.(key);
	}

	function toggleSeries(key: string) {
		selectSeries(selectedDataKey === key ? null : key);
	}

	const events = $derived({
		click: (params: unknown) => {
			const event = params as { seriesId?: unknown; seriesIndex?: unknown } | null;
			const indexedKey =
				typeof event?.seriesIndex === 'number' ? seriesKeys[event.seriesIndex] : undefined;
			const key = String(event?.seriesId ?? indexedKey ?? '');
			if (!key || key.startsWith('__')) return;
			if (radars.find((radar) => radar.dataKey === key)?.isClickable) toggleSeries(key);
		}
	});

	$effect(() => {
		const chartInstance = instance;
		if (!chartInstance || isLoading || tooltip?.defaultIndex === undefined) return;
		const defaultSeriesIndex = Math.min(
			Math.max(tooltip.defaultIndex, 0),
			Math.max(0, seriesKeys.length - 1)
		);
		if (seriesKeys.length === 0) return;
		const frame = requestAnimationFrame(() => {
			chartInstance.dispatchAction({
				type: 'showTip',
				seriesIndex: defaultSeriesIndex,
				dataIndex: 0
			});
		});
		return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
		const chartInstance = instance;
		const series = (fullOption.series as unknown as RevealSeries[] | undefined) ?? [];
		if (isLoading) {
			hasRevealed = false;
			return;
		}
		if (
			!chartInstance ||
			hasRevealed ||
			series.length === 0 ||
			!animation ||
			prefersReducedMotion.current
		) {
			if (chartInstance && series.length > 0) hasRevealed = true;
			return;
		}
		const targets = series.map((item) => item.data?.[0]?.value ?? []);
		let frame = 0;
		let cancelled = false;
		hasRevealed = true;
		if (!chartInstance.isDisposed()) {
			chartInstance.setOption(
				{
					series: series.map((item, index) => ({
						id: item.id,
						data: [{ value: targets[index].map(() => 0) }]
					}))
				},
				{ silent: true, lazyUpdate: false }
			);
			const startedAt = performance.now();
			const tick = (now: number) => {
				if (cancelled || chartInstance.isDisposed()) return;
				const progress = Math.min(1, (now - startedAt) / REVEAL_DURATION);
				const eased = 1 - Math.pow(1 - progress, 3);
				chartInstance.setOption(
					{
						series: series.map((item, index) => ({
							id: item.id,
							data: [{ value: targets[index].map((value) => value * eased) }]
						}))
					},
					{ silent: true, lazyUpdate: true }
				);
				if (progress < 1) frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
		}
		return () => {
			cancelled = true;
			cancelAnimationFrame(frame);
		};
	});

	$effect(() => {
		const chartInstance = instance;
		if (!chartInstance || !isLoading) return;
		const startedAt = performance.now();
		let currentLoadingData = loadingData;
		let lastPhase = 0;
		let frame = 0;
		const tick = (now: number) => {
			const phase = ((((now - startedAt) / LOADING_ANIMATION_DURATION) % 1) + 1) % 1;
			if (phase < lastPhase) currentLoadingData = createRadarLoadingData(loadingPoints);
			lastPhase = phase;
			const width = chartInstance.getWidth();
			const height = chartInstance.getHeight();
			if (!width || !height) {
				frame = requestAnimationFrame(tick);
				return;
			}
			const maxProgress = (width + height) / (2 * width);
			const center = phase * (maxProgress + 0.4) - 0.2;
			const clip = (peak: number) =>
				new echarts.graphic.LinearGradient(
					0,
					0,
					width,
					width,
					createRadarShimmerStops(center, resolved.tokens.foreground, peak),
					true
				);
			chartInstance.setOption(
				{
					series: [
						{
							id: '__loading',
							data: [{ value: currentLoadingData }],
							lineStyle: { color: clip(0.5), width: 2 },
							areaStyle: { color: clip(0.05) }
						}
					]
				},
				{ silent: true, lazyUpdate: true }
			);
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});

	const legendStyle = $derived(
		`position:absolute;left:16px;right:16px;${
			legend?.verticalAlign === 'top'
				? 'top:12px;'
				: legend?.verticalAlign === 'middle'
					? 'top:50%;transform:translateY(-50%);'
					: 'bottom:12px;'
		}`
	);
</script>

<ChartContainer
	{config}
	{accessibility}
	bind:element={container}
	bind:themeRevision
	bind:dimension
	class={className}
>
	{@render children?.()}
	<EChartsHost {option} {renderer} {events} bind:instance />
	{#if legend && !isLoading}
		<LegendOverlay
			{seriesKeys}
			{config}
			variant={legend.variant}
			align={legend.align}
			selectedKey={selectedDataKey}
			hoveredKey={null}
			isClickable={legend.isClickable}
			onToggle={toggleSeries}
			style={legendStyle}
		/>
	{/if}
	<LoadingIndicator {isLoading} />
</ChartContainer>
