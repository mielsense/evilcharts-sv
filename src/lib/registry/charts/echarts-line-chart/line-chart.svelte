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
	import { LineChart } from 'echarts/charts';
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
	import { setEChartsLineChartContext } from './line-chart-context.svelte.js';
	import { buildLineOption, createLineLoadingData } from './option.js';
	import {
		companionSeriesIds,
		resolveEventSeriesKey,
		sliceFromIndex,
		sliceToIndex
	} from './interactions.js';
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
		bloom = 'off',
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
		bloom?: DitherBloom;
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
	let hoverRevealIndex: number | null = null;
	let introComplete = $state(false);
	let previousLoading = untrack(() => isLoading);
	let brushRange = $state({ start: 0, end: 100 });
	let loadingData = $state.raw<number[]>(untrack(() => createLineLoadingData(loadingPoints)));
	let brushOverlayInstance: EChartsType | undefined;
	let brushHover = { inside: false, left: false, right: false };
	const brushOverlayStore: { brushOverlay: BrushOverlayElements | null } = { brushOverlay: null };
	const revealValues: Record<string, unknown[]> = {};
	let seriesKeyByIndex: (string | undefined)[] = [];
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
			if (slot === 'tooltip')
				return tooltipSlots.register(token, getter as () => TooltipRegistration);
			if (slot === 'legend') return legendSlots.register(token, getter as () => LegendRegistration);
			return brushSlots.register(token, getter as () => BrushRegistration);
		}
	});

	const lines = $derived(chart.lines.values);
	const selectableSeries = $derived(
		lines
			.filter((line) => line.isClickable)
			.filter(
				(line, index, all) => all.findIndex((item) => item.dataKey === line.dataKey) === index
			)
			.map((line) => ({
				key: line.dataKey,
				label:
					typeof config[line.dataKey]?.label === 'string'
						? (config[line.dataKey].label as string)
						: line.dataKey
			}))
	);
	const seriesKeys = $derived(lines.map((line) => line.dataKey));
	const xAxis = $derived(chart.xAxes.first);
	const yAxis = $derived(chart.yAxes.first);
	const tooltip = $derived(tooltipSlots.first);
	const legend = $derived(legendSlots.first);
	const brush = $derived(brushSlots.first);
	const effectiveAnimation = $derived(lines[0]?.animationType ?? animationType);
	const categoryValues = $derived.by(() => {
		const series = new Set(lines.map((line) => line.dataKey));
		const key =
			xAxis?.dataKey ?? xDataKey ?? Object.keys(data[0] ?? {}).find((item) => !series.has(item));
		return data.map((row, index) => String((key ? row[key] : undefined) ?? index));
	});

	$effect(() => {
		loadingData = createLineLoadingData(loadingPoints);
	});

	$effect(() => {
		const loadingNow = isLoading;
		if (previousLoading && !loadingNow) introComplete = false;
		previousLoading = loadingNow;
	});

	$effect(() => {
		void themeRevision;
		const host = container;
		const keys = seriesKeys;
		if (!host) return;
		resolved = resolveColors(host, config, keys);
	});

	const option = $derived.by(() => {
		for (const key of Object.keys(revealValues)) delete revealValues[key];
		const built = buildLineOption({
			data,
			config,
			lines,
			xDataKey,
			curveType,
			selectedDataKey,
			enableHoverHighlight,
			enableHoverReveal,
			hoverRevealIndex: null,
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
			animation: animation && !introComplete,
			animationType,
			reducedMotion: prefersReducedMotion.current,
			rendererSize: dimension,
			renderStyle,
			ditherVariant,
			ditherCellSize,
			bloom,
			getHoveredDataKey: () => hoveredDataKey,
			revealSink: revealValues
		});
		seriesKeyByIndex = (Array.isArray(built.series) ? built.series : [built.series])
			.filter(Boolean)
			.map((series) => {
				const id = (series as { id?: unknown }).id;
				return typeof id === 'string' && !id.startsWith('__') ? id : undefined;
			});
		return mergeLifecycleOptions(built, chartOptions) as EChartsCoreOption;
	});

	$effect(() => {
		if (introComplete || !instance || lines.length === 0 || isLoading) return;
		if (!animation || effectiveAnimation === 'none' || prefersReducedMotion.current) {
			introComplete = true;
			return;
		}
		const timer = window.setTimeout(() => (introComplete = true), 1000);
		return () => window.clearTimeout(timer);
	});

	function syncBrushOverlayNow() {
		const chartInstance = instance;
		if (!chartInstance) return;
		if (brushOverlayInstance !== chartInstance) {
			brushOverlayStore.brushOverlay = null;
			brushOverlayInstance = chartInstance;
		}
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
	}

	$effect(() => {
		void brushRange;
		void dimension;
		void resolved;
		void categoryValues;
		syncBrushOverlayNow();
	});

	function companionsFor(key: string): string[] {
		const line = lines.find((candidate) => candidate.dataKey === key);
		return line ? companionSeriesIds(line, enableHoverReveal, data.length) : [];
	}

	function clearHoveredSeries() {
		const key = hoveredDataKey;
		if (key && instance) {
			for (const seriesId of companionsFor(key)) {
				instance.dispatchAction({ type: 'downplay', seriesId });
			}
		}
		hoveredDataKey = null;
	}

	function toggleSelection(key: string) {
		clearHoveredSeries();
		selectedDataKey = selectedDataKey === key ? null : key;
		onSelectionChange?.(selectedDataKey);
	}

	function toggleLegendSelection(key: string) {
		if (legend?.isClickable) toggleSelection(key);
	}

	const events = $derived({
		click: (params: unknown) => {
			const key = resolveEventSeriesKey(params, seriesKeyByIndex);
			if (key && lines.some((line) => line.dataKey === key && line.isClickable)) {
				toggleSelection(key);
			}
		},
		mouseover: (params: unknown) => {
			if (!enableHoverHighlight || enableHoverReveal || selectedDataKey !== null) return;
			const key = resolveEventSeriesKey(params, seriesKeyByIndex);
			if (!key || key === hoveredDataKey) return;
			clearHoveredSeries();
			hoveredDataKey = key;
			if (instance) {
				for (const seriesId of companionsFor(key)) {
					instance.dispatchAction({ type: 'highlight', seriesId });
				}
			}
		},
		mouseout: clearHoveredSeries,
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
		if (!chartInstance) return;
		hoverRevealIndex = null;
		hoveredDataKey = null;
		brushHover = { inside: false, left: false, right: false };
		const renderer = chartInstance.getZr();
		const pushReveal = (index: number | null) => {
			const active = index !== null;
			chartInstance.setOption(
				{
					series: seriesKeys.flatMap((key) => {
						const values = revealValues[key] ?? [];
						return [
							{
								id: key,
								data: active ? sliceToIndex(values, index) : values
							},
							{
								id: `__reveal-base-${key}`,
								data: active ? sliceFromIndex(values, index) : values,
								lineStyle: { opacity: active ? 0.3 : 0 }
							}
						];
					})
				},
				{ silent: true }
			);
			for (const key of seriesKeys) {
				chartInstance.dispatchAction(
					active
						? { type: 'highlight', seriesId: key, dataIndex: index }
						: { type: 'downplay', seriesId: key }
				);
			}
		};
		const clearReveal = () => {
			if (hoverRevealIndex === null) return;
			hoverRevealIndex = null;
			pushReveal(null);
		};
		const onMove = (event: { offsetX?: number; offsetY?: number }) => {
			const x = event.offsetX ?? -1;
			const y = event.offsetY ?? -1;
			if (enableHoverReveal) {
				if (data.length > 0 && chartInstance.containPixel({ gridIndex: 0 }, [x, y])) {
					const raw = chartInstance.convertFromPixel({ gridIndex: 0 }, [x, y])[0];
					const index = Math.max(0, Math.min(data.length - 1, Math.round(Number(raw))));
					if (index !== hoverRevealIndex) {
						hoverRevealIndex = index;
						pushReveal(index);
					}
				} else {
					clearReveal();
				}
			}

			if (!brush || isLoading) return;
			const height = brush.height ?? 56;
			const bottom = legend?.verticalAlign === 'bottom' ? 34 : 6;
			const top = chartInstance.getHeight() - bottom - height;
			const inside = y >= top - 4 && y <= top + height + 4;
			const trackWidth = Math.max(chartInstance.getWidth() - 16, 1);
			const left = 8 + (trackWidth * brushRange.start) / 100;
			const right = 8 + (trackWidth * brushRange.end) / 100;
			const next = {
				inside,
				left: inside && Math.abs(x - left) <= 8,
				right: inside && Math.abs(x - right) <= 8
			};
			if (
				next.inside !== brushHover.inside ||
				next.left !== brushHover.left ||
				next.right !== brushHover.right
			) {
				brushHover = next;
				syncBrushOverlayNow();
			}
		};
		const onOut = () => {
			clearReveal();
			brushHover = { inside: false, left: false, right: false };
			syncBrushOverlayNow();
		};
		renderer.on('mousemove', onMove);
		renderer.on('globalout', onOut);
		return () => {
			clearReveal();
			renderer.off('mousemove', onMove);
			renderer.off('globalout', onOut);
		};
	});

	$effect(() => {
		const chartInstance = instance;
		const animatedKeys = lines
			.filter((line) => line.strokeVariant === 'animated-dashed' && !line.enableBufferLine)
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
		if (prefersReducedMotion.current) {
			chartInstance.setOption(
				{
					series: [
						{
							id: '__loading',
							data: loadingData,
							lineStyle: { color: withAlpha(resolved.tokens.foreground, 0.5), width: 1 }
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
			const phase = ((now - start) / 2000) % 1;
			if (phase < lastPhase) loadingData = createLineLoadingData(loadingPoints);
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
			const alphaAt = (offset: number) => {
				const distance = Math.abs(offset - center);
				if (distance >= 0.2) return 0;
				return 0.5 * Math.sin(((1 - distance / 0.2) * Math.PI) / 2);
			};
			const stops = [0, center - 0.2, center, center + 0.2, 1]
				.filter((offset) => offset >= 0 && offset <= 1)
				.sort((left, right) => left - right)
				.filter((offset, index, values) => index === 0 || offset - values[index - 1] > 0.0001)
				.map((offset) => ({ offset, color: withAlpha(color, alphaAt(offset)) }));
			chartInstance.setOption(
				{
					series: [
						{
							id: '__loading',
							data: loadingData,
							lineStyle: {
								color: new echarts.graphic.LinearGradient(0, 0, width, width, stops, true),
								width: 1
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
			onToggle={toggleLegendSelection}
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
