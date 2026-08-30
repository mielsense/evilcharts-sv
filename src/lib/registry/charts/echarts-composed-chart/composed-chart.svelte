<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import { untrack, type Snippet } from 'svelte';
	import type { EChartsCoreOption, EChartsType } from 'echarts/core';
	import {
		AriaComponent,
		DataZoomComponent,
		GridComponent,
		TooltipComponent
	} from 'echarts/components';
	import { BarChart, LineChart } from 'echarts/charts';
	import * as echarts from 'echarts/core';
	import {
		ChartContainer,
		DEFAULT_ECHARTS_RENDERER,
		EChartsHost,
		LoadingIndicator,
		mergeLifecycleOptions,
		RegistrationSet,
		SelectableSeriesControls,
		resolveColors,
		setEChartsSharedSlotContext,
		withAlpha,
		type ChartAccessibility,
		type ChartConfig,
		type EChartsRenderer,
		type EChartsRenderStyle,
		type ResolvedColors
	} from '../../ui/echarts-chart/index.js';
	import type { DitherBloom, DitherVariant } from '../../ui/echarts-dither/index.js';
	import { LegendOverlay } from '../../ui/echarts-legend/index.js';
	import {
		BrushControls,
		syncBrushOverlay,
		type BrushOverlayElements
	} from '../../ui/echarts-brush/index.js';
	import { setEChartsComposedChartContext } from './composed-chart-context.svelte.js';
	import { buildComposedOption, createComposedLoadingData } from './option.js';
	import type {
		BrushRegistration,
		CurveType,
		LegendRegistration,
		ComposedAnimationType,
		TooltipRegistration
	} from './types.js';

	echarts.use([
		BarChart,
		LineChart,
		GridComponent,
		TooltipComponent,
		DataZoomComponent,
		AriaComponent
	]);

	let {
		data,
		config,
		renderer = DEFAULT_ECHARTS_RENDERER,
		renderStyle = 'native',
		ditherVariant = 'gradient',
		ditherCellSize = 2,
		bloom = 'off',
		xDataKey,
		class: className,
		curveType = 'linear',
		animation = true,
		animationType = 'left-to-right',
		barGap,
		barCategoryGap,
		defaultSelectedDataKey = null,
		onSelectionChange,
		isLoading = false,
		loadingBars = 12,
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
		bloom?: DitherBloom;
		xDataKey?: string;
		class?: string;
		curveType?: CurveType;
		animation?: boolean;
		animationType?: ComposedAnimationType;
		barGap?: number | string;
		barCategoryGap?: number | string;
		defaultSelectedDataKey?: string | null;
		onSelectionChange?: (key: string | null) => void;
		isLoading?: boolean;
		loadingBars?: number;
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
	let introComplete = $state(false);
	let brushRange = $state({ start: 0, end: 100 });
	let brushHover = $state({ inside: false, left: false, right: false });
	const brushOverlayStore: { brushOverlay: BrushOverlayElements | null } = { brushOverlay: null };
	let resolved = $state.raw<ResolvedColors>({
		series: {},
		tokens: {
			mutedForeground: 'rgba(120, 120, 120, 1)',
			border: 'rgba(120, 120, 120, 0.35)',
			foreground: 'rgba(120, 120, 120, 1)',
			background: 'rgba(0, 0, 0, 1)'
		}
	});

	const chart = setEChartsComposedChartContext();
	const tooltipSlots = new RegistrationSet<TooltipRegistration>();
	const legendSlots = new RegistrationSet<LegendRegistration>();
	const brushSlots = new RegistrationSet<BrushRegistration>();
	setEChartsSharedSlotContext({
		register(slot, token, getter) {
			if (slot === 'tooltip')
				return tooltipSlots.register(token, getter as () => TooltipRegistration);
			if (slot === 'legend') return legendSlots.register(token, getter as () => LegendRegistration);
			return brushSlots.register(token, getter as () => BrushRegistration);
		}
	});

	const bars = $derived(chart.bars.values);
	const lines = $derived(chart.lines.values);
	const selectableSeries = $derived(
		[...bars, ...lines]
			.filter((series) => series.isClickable)
			.filter(
				(series, index, all) => all.findIndex((item) => item.dataKey === series.dataKey) === index
			)
			.map((series) => ({
				key: series.dataKey,
				label:
					typeof config[series.dataKey]?.label === 'string'
						? (config[series.dataKey].label as string)
						: series.dataKey
			}))
	);
	const effectiveAnimation = $derived(
		bars[0]?.animationType ?? lines[0]?.animationType ?? animationType
	);
	const seriesKeys = $derived([
		...bars.map((bar) => bar.dataKey),
		...lines.map((line) => line.dataKey)
	]);
	const xAxis = $derived(chart.xAxes.first);
	const yAxis = $derived(chart.yAxes.first);
	const tooltip = $derived(tooltipSlots.first);
	const legend = $derived(legendSlots.first);
	const brush = $derived(brushSlots.first);
	let loadingData = $state.raw<number[]>(untrack(() => createComposedLoadingData(loadingBars)));
	let loadingLineData = $state.raw<number[]>(untrack(() => createComposedLoadingData(loadingBars)));
	$effect(() => {
		loadingData = createComposedLoadingData(loadingBars);
		loadingLineData = createComposedLoadingData(loadingBars);
	});
	const categoryValues = $derived.by(() => {
		const series = new Set([
			...bars.map((bar) => bar.dataKey),
			...lines.map((line) => line.dataKey)
		]);
		const key =
			xDataKey ?? xAxis?.dataKey ?? Object.keys(data[0] ?? {}).find((item) => !series.has(item));
		return data.map((row, index) => String((key ? row[key] : undefined) ?? index));
	});

	$effect(() => {
		void themeRevision;
		const host = container;
		const keys = seriesKeys;
		if (!host) return;
		resolved = resolveColors(host, config, keys);
	});

	const option = $derived.by(() => {
		const built = buildComposedOption({
			data,
			config,
			bars,
			lines,
			xDataKey,
			curveType,
			barGap,
			barCategoryGap,
			selectedDataKey,
			xAxis,
			yAxis,
			showGrid: chart.grids.size > 0,
			tooltip,
			legend,
			brush,
			brushRange,
			isLoading,
			loadingData,
			loadingLineData,
			resolved,
			animation: animation && !introComplete && effectiveAnimation !== 'none',
			animationType,
			reducedMotion: prefersReducedMotion.current,
			rendererSize: dimension,
			renderStyle,
			ditherVariant,
			ditherCellSize,
			bloom
		});
		return mergeLifecycleOptions(built, chartOptions) as EChartsCoreOption;
	});

	$effect(() => {
		if (isLoading) {
			introComplete = false;
			return;
		}
		if (introComplete || !instance || bars.length + lines.length === 0) return;
		if (!animation || effectiveAnimation === 'none' || prefersReducedMotion.current) {
			introComplete = true;
			return;
		}
		const timer = window.setTimeout(
			() => (introComplete = true),
			Math.max(1000, 500 + Math.max(0, data.length - 1) * 50)
		);
		return () => window.clearTimeout(timer);
	});

	$effect(() => {
		const chartInstance = instance;
		if (!chartInstance) return;
		if (!brush || isLoading) {
			syncBrushOverlay(chartInstance, brushOverlayStore, null);
			return;
		}
		const last = Math.max(0, categoryValues.length - 1);
		const startIndex = Math.round((brushRange.start / 100) * last);
		const endIndex = Math.round((brushRange.end / 100) * last);
		const format = brush.formatLabel;
		syncBrushOverlay(chartInstance, brushOverlayStore, {
			range: brushRange,
			geom: { bottom: legend?.verticalAlign === 'bottom' ? 34 : 6, height: brush.height ?? 56 },
			size: dimension,
			tokens: resolved.tokens,
			labels: format
				? {
						start: format(categoryValues[startIndex] ?? '', startIndex),
						end: format(categoryValues[endIndex] ?? '', endIndex)
					}
				: null,
			showLabels: brushHover.inside,
			hover: brushHover
		});
	});

	$effect(() => {
		const chartInstance = instance;
		const activeBrush = brush;
		const currentLegend = legend;
		if (!chartInstance || !activeBrush || isLoading) return;
		const renderer = chartInstance.getZr();
		const move = (event: { offsetX?: number; offsetY?: number }) => {
			const x = event.offsetX ?? -1;
			const y = event.offsetY ?? -1;
			const height = activeBrush.height ?? 56;
			const bottom = currentLegend?.verticalAlign === 'bottom' ? 34 : 6;
			const top = chartInstance.getHeight() - bottom - height;
			const inside = y >= top - 4 && y <= top + height + 4;
			const trackWidth = Math.max(chartInstance.getWidth() - 16, 1);
			const leftX = 8 + (trackWidth * brushRange.start) / 100;
			const rightX = 8 + (trackWidth * brushRange.end) / 100;
			brushHover = {
				inside,
				left: inside && Math.abs(x - leftX) <= 8,
				right: inside && Math.abs(x - rightX) <= 8
			};
		};
		const out = () => {
			brushHover = { inside: false, left: false, right: false };
		};
		renderer.on('mousemove', move);
		renderer.on('globalout', out);
		return () => {
			renderer.off('mousemove', move);
			renderer.off('globalout', out);
		};
	});

	$effect(() => {
		const chartInstance = instance;
		const index = tooltip?.defaultIndex;
		if (!chartInstance || isLoading || index === undefined) return;
		const timer = window.setTimeout(
			() => {
				if (!chartInstance.isDisposed()) {
					chartInstance.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: index });
				}
			},
			animation && effectiveAnimation !== 'none' && !prefersReducedMotion.current ? 1060 : 60
		);
		return () => {
			window.clearTimeout(timer);
			if (!chartInstance.isDisposed()) chartInstance.dispatchAction({ type: 'hideTip' });
		};
	});

	function toggleSelection(key: string) {
		if (
			![...bars, ...lines].some((series) => series.dataKey === key && series.isClickable) &&
			!legend?.isClickable
		) {
			return;
		}
		const next = selectedDataKey === key ? null : key;
		selectedDataKey = next;
		onSelectionChange?.(next);
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
			if (selectedDataKey !== null) return;
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
		}
	});

	$effect(() => {
		const chartInstance = instance;
		const animatedKeys = lines
			.filter((line) => line.strokeVariant === 'animated-dashed')
			.map((line) => line.dataKey);
		if (
			!chartInstance ||
			isLoading ||
			selectedDataKey !== null ||
			animatedKeys.length === 0 ||
			prefersReducedMotion.current ||
			!introComplete
		)
			return;
		let frame = 0;
		const start = performance.now();
		const tick = (now: number) => {
			if (chartInstance.isDisposed()) return;
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
		if (!chartInstance || chartInstance.isDisposed() || !isLoading) return;
		if (prefersReducedMotion.current) {
			chartInstance.setOption(
				{
					series: [
						{
							id: '__loading',
							data: loadingData,
							itemStyle: { color: withAlpha(resolved.tokens.foreground, 0.22) }
						},
						{
							id: '__loading-line',
							data: loadingLineData,
							lineStyle: { color: withAlpha(resolved.tokens.foreground, 0.5) }
						}
					]
				},
				{ silent: true, lazyUpdate: true }
			);
			return;
		}
		let frame = 0;
		let lastPhase = 0;
		const start = performance.now();
		const tick = (now: number) => {
			if (chartInstance.isDisposed()) return;
			const phase = ((now - start) / 2000) % 1;
			if (phase < lastPhase) {
				loadingData = createComposedLoadingData(loadingBars);
				loadingLineData = createComposedLoadingData(loadingBars);
			}
			lastPhase = phase;
			const width = chartInstance.getWidth();
			const height = chartInstance.getHeight();
			if (!width || !height) {
				frame = requestAnimationFrame(tick);
				return;
			}
			const maxT = (width + height) / (2 * width);
			const center = phase * (maxT + 0.4) - 0.2;
			const color = resolved.tokens.foreground;
			const stops = (peak: number) =>
				[0, center - 0.2, center, center + 0.2, 1]
					.filter((offset) => offset >= 0 && offset <= 1)
					.sort((left, right) => left - right)
					.filter(
						(offset, index, all) =>
							index === 0 || offset - (all[index - 1] ?? Number.NEGATIVE_INFINITY) > 0.0001
					)
					.map((offset) => {
						const distance = Math.abs(offset - center);
						const alpha =
							distance >= 0.2 ? 0 : peak * Math.sin(((1 - distance / 0.2) * Math.PI) / 2);
						return { offset, color: withAlpha(color, alpha) };
					});
			chartInstance.setOption(
				{
					series: [
						{
							id: '__loading',
							data: loadingData,
							itemStyle: {
								color: new echarts.graphic.LinearGradient(0, 0, width, width, stops(0.22), true)
							}
						},
						{
							id: '__loading-line',
							data: loadingLineData,
							lineStyle: {
								color: new echarts.graphic.LinearGradient(
									0,
									0,
									Math.max(width, 1),
									Math.max(width, 1),
									stops(0.5),
									true
								)
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

{#snippet overlay()}
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
{/snippet}

<ChartContainer
	{config}
	{accessibility}
	{overlay}
	bind:element={container}
	bind:dimension
	bind:themeRevision
	aria-busy={isLoading}
	class={className}
>
	{@render children?.()}
	<EChartsHost {option} {renderer} {events} bind:instance />
	{#if !legend?.isClickable}
		<SelectableSeriesControls
			items={selectableSeries}
			selectedKey={selectedDataKey}
			onToggle={toggleSelection}
		/>
	{/if}
	{#if brush && !isLoading && data.length > 0}
		<BrushControls
			startIndex={Math.round((brushRange.start / 100) * Math.max(0, data.length - 1))}
			endIndex={Math.round((brushRange.end / 100) * Math.max(0, data.length - 1))}
			totalPoints={data.length}
			formatLabel={(index) =>
				brush.formatLabel?.(categoryValues[index] ?? '', index) ??
				String(categoryValues[index] ?? index)}
			onChange={(range) => {
				const last = Math.max(0, data.length - 1);
				brushRange = {
					start: last === 0 ? 0 : (range.startIndex / last) * 100,
					end: last === 0 ? 100 : (range.endIndex / last) * 100
				};
				instance?.dispatchAction(
					{ type: 'dataZoom', start: brushRange.start, end: brushRange.end },
					{ silent: true }
				);
				brush.onChange?.(range);
			}}
		/>
	{/if}
</ChartContainer>
