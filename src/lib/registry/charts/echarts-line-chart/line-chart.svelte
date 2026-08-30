<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import { untrack, type Snippet } from 'svelte';
	import type { EChartsCoreOption, EChartsType } from 'echarts/core';
	import { AriaComponent, DataZoomComponent, GridComponent, TooltipComponent } from 'echarts/components';
	import { LineChart } from 'echarts/charts';
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
		type EChartsRenderStyle,
		type ResolvedColors
	} from '../../ui/echarts-chart/index.js';
	import type { DitherVariant } from '../../ui/echarts-dither/index.js';
	import { LegendOverlay, type LegendProps } from '../../ui/echarts-legend/index.js';
	import type { TooltipProps } from '../../ui/echarts-tooltip/index.js';
	import type { BrushProps } from '../../ui/echarts-brush/index.js';
	import { setEChartsLineChartContext } from './line-chart-context.svelte.js';
	import { buildLineOption, createLineLoadingData } from './option.js';
	import type {
		BrushRegistration,
		CurveType,
		LegendRegistration,
		LineAnimationType,
		TooltipRegistration
	} from './types.js';

	echarts.use([LineChart, GridComponent, TooltipComponent, DataZoomComponent, AriaComponent]);

	let {
		data,
		config,
		renderer = DEFAULT_ECHARTS_RENDERER,
		renderStyle = 'native',
		ditherVariant = 'gradient',
		ditherCellSize = 2,
		xDataKey,
		class: className,
		curveType = 'linear',
		animation = true,
		animationType = 'left-to-right',
		enableHoverHighlight = false,
		enableHoverReveal = false,
		defaultSelectedDataKey = null,
		onSelectionChange,
		isLoading = false,
		loadingPoints = 14,
		chartOptions,
		accessibility,
		children
	}: {
		data: Record<string, unknown>[];
		config: ChartConfig;
		renderer?: EChartsRenderer;
		renderStyle?: EChartsRenderStyle;
		ditherVariant?: DitherVariant;
		ditherCellSize?: number;
		xDataKey?: string;
		class?: string;
		curveType?: CurveType;
		animation?: boolean;
		animationType?: LineAnimationType;
		enableHoverHighlight?: boolean;
		enableHoverReveal?: boolean;
		defaultSelectedDataKey?: string | null;
		onSelectionChange?: (key: string | null) => void;
		isLoading?: boolean;
		loadingPoints?: number;
		chartOptions?: Record<string, unknown>;
		accessibility?: ChartAccessibility;
		children?: Snippet;
	} = $props();

	let container = $state<HTMLDivElement>();
	let dimension = $state({ width: 320, height: 200 });
	let themeRevision = $state(0);
	let instance = $state.raw<EChartsType>();
	let selectedDataKey = $state<string | null>(untrack(() => defaultSelectedDataKey));
	let hoveredDataKey = $state<string | null>(null);
	let hoverRevealIndex = $state<number | null>(null);
	let brushRange = $state({ start: 0, end: 100 });
	let resolved = $state.raw<ResolvedColors>({
		series: {},
		tokens: {
			mutedForeground: 'rgba(120, 120, 120, 1)',
			border: 'rgba(120, 120, 120, 0.35)',
			foreground: 'rgba(120, 120, 120, 1)',
			background: 'rgba(0, 0, 0, 1)'
		}
	});

	const chart = setEChartsLineChartContext();
	const tooltipSlots = new RegistrationSet<TooltipRegistration>();
	const legendSlots = new RegistrationSet<LegendRegistration>();
	const brushSlots = new RegistrationSet<BrushRegistration>();
	setEChartsSharedSlotContext({
		register(slot, token, getter) {
			if (slot === 'tooltip') return tooltipSlots.register(token, getter as () => TooltipRegistration);
			if (slot === 'legend') return legendSlots.register(token, getter as () => LegendRegistration);
			return brushSlots.register(token, getter as () => BrushRegistration);
		}
	});

	const lines = $derived(chart.lines.values);
	const seriesKeys = $derived(lines.map((line) => line.dataKey));
	const xAxis = $derived(chart.xAxes.first);
	const yAxis = $derived(chart.yAxes.first);
	const tooltip = $derived(tooltipSlots.first);
	const legend = $derived(legendSlots.first);
	const brush = $derived(brushSlots.first);
	const loadingData = $derived(createLineLoadingData(loadingPoints));

	$effect(() => {
		void themeRevision;
		const host = container;
		const keys = seriesKeys;
		if (!host) return;
		resolved = resolveColors(host, config, keys);
	});

	const option = $derived.by(() => {
		const built = buildLineOption({
			data,
			config,
			lines,
			xDataKey,
			curveType,
			selectedDataKey,
			enableHoverHighlight,
			enableHoverReveal,
			hoverRevealIndex,
			xAxis,
			yAxis,
			showGrid: chart.grids.size > 0,
			tooltip,
			legend,
			brush,
			brushRange,
			isLoading,
			loadingData,
			resolved,
			animation,
			animationType,
			reducedMotion: prefersReducedMotion.current,
			renderStyle,
			ditherVariant,
			ditherCellSize
		});
		return (chartOptions ? { ...built, ...chartOptions } : built) as EChartsCoreOption;
	});

	function toggleSelection(key: string) {
		if (!lines.some((line) => line.dataKey === key && line.isClickable) && !legend?.isClickable) {
			return;
		}
		selectedDataKey = selectedDataKey === key ? null : key;
		onSelectionChange?.(selectedDataKey);
	}

	function eventSeriesKey(params: unknown): string | null {
		if (!params || typeof params !== 'object') return null;
		const id = (params as { seriesId?: unknown }).seriesId;
		if (typeof id !== 'string' || id.startsWith('__')) return null;
		return id;
	}

	const events = $derived({
		click: (params: unknown) => {
			const key = eventSeriesKey(params);
			if (key) toggleSelection(key);
		},
		mouseover: (params: unknown) => {
			if (!enableHoverHighlight || enableHoverReveal || selectedDataKey !== null) return;
			hoveredDataKey = eventSeriesKey(params);
		},
		mouseout: () => {
			hoveredDataKey = null;
		},
		datazoom: () => {
			const zoom = (instance?.getOption() as { dataZoom?: { start?: number; end?: number }[] })
				?.dataZoom?.[0];
			if (!zoom) return;
			brushRange = { start: zoom.start ?? 0, end: zoom.end ?? 100 };
			if (!brush?.onChange) return;
			const last = Math.max(0, data.length - 1);
			brush.onChange({
				startIndex: Math.round((brushRange.start / 100) * last),
				endIndex: Math.round((brushRange.end / 100) * last)
			});
		},
		updateAxisPointer: (params: unknown) => {
			if (!enableHoverReveal || !params || typeof params !== 'object') return;
			const axesInfo = (params as { axesInfo?: Array<{ value?: unknown }> }).axesInfo;
			const value = axesInfo?.[0]?.value;
			const categoryDataKey =
				xDataKey ??
				xAxis?.dataKey ??
				Object.keys(data[0] ?? {}).find((key) => !seriesKeys.includes(key));
			const categoryIndex = data.findIndex(
				(row) => String(categoryDataKey ? row[categoryDataKey] : '') === String(value)
			);
			const numericIndex = typeof value === 'number' ? value : Number(value);
			const index = categoryIndex >= 0 ? categoryIndex : numericIndex;
			hoverRevealIndex = Number.isInteger(index) ? index : null;
		},
		globalout: () => {
			hoverRevealIndex = null;
		}
	});

	$effect(() => {
		const chartInstance = instance;
		const animatedKeys = lines
			.filter((line) => line.strokeVariant === 'animated-dashed' && !line.enableBufferLine)
			.map((line) => line.dataKey);
		if (!chartInstance || isLoading || selectedDataKey !== null || animatedKeys.length === 0) return;
		let frame = 0;
		const start = performance.now();
		const tick = (now: number) => {
			const dashOffset = -(((now - start) / 1000) % 1) * 6;
			chartInstance.setOption(
				{ series: animatedKeys.map((id) => ({ id, lineStyle: { dashOffset } })) },
				{ silent: true, lazyUpdate: true }
			);
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
		const chartInstance = instance;
		if (!chartInstance || !isLoading) return;
		let frame = 0;
		const start = performance.now();
		const tick = (now: number) => {
			const phase = ((now - start) / 2000) % 1;
			const width = chartInstance.getWidth();
			const center = phase * 1.4 - 0.2;
			const color = resolved.tokens.foreground;
			const stops = [
				{ offset: 0, color: 'transparent' },
				{ offset: Math.max(0, center - 0.2), color: 'transparent' },
				{ offset: Math.max(0, Math.min(1, center)), color },
				{ offset: Math.min(1, center + 0.2), color: 'transparent' },
				{ offset: 1, color: 'transparent' }
			].sort((left, right) => left.offset - right.offset);
			chartInstance.setOption(
				{
					series: [
						{
							id: '__loading',
							lineStyle: {
								color: new echarts.graphic.LinearGradient(0, 0, Math.max(width, 1), Math.max(width, 1), stops, true)
							}
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
			legend?.verticalAlign === 'bottom'
				? `bottom:${brush ? (brush.height ?? 56) + 16 : 12}px;`
				: legend?.verticalAlign === 'middle'
					? 'top:50%;transform:translateY(-50%);'
					: 'top:12px;'
		}`
	);
</script>

<ChartContainer
	{config}
	{accessibility}
	bind:element={container}
	bind:dimension
	bind:themeRevision
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
			hoveredKey={hoveredDataKey}
			isClickable={legend.isClickable}
			onToggle={toggleSelection}
			style={legendStyle}
		/>
	{/if}
	<LoadingIndicator {isLoading} />
</ChartContainer>
