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
		RegistrationSet,
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
	import { syncBrushOverlay, type BrushOverlayElements } from '../../ui/echarts-brush/index.js';
	import { setEChartsAreaChartContext } from './area-chart-context.svelte.js';
	import {
		buildAreaOption,
		computeAreaPlottedTops,
		createAreaLoadingData,
		resolveAreaAtPixel,
		type AreaOptionContext
	} from './option.js';
	import type {
		BrushRegistration,
		CurveType,
		LegendRegistration,
		AreaAnimationType,
		StackType,
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
		stackType = 'default',
		animation = true,
		animationType = 'left-to-right',
		enableHoverHighlight = false,
		enableHoverReveal = false,
		defaultSelectedDataKey = null,
		selectedDataKey: selectedDataKeyProp,
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
		stackType?: StackType;
		animation?: boolean;
		animationType?: AreaAnimationType;
		enableHoverHighlight?: boolean;
		enableHoverReveal?: boolean;
		defaultSelectedDataKey?: string | null;
		selectedDataKey?: string | null;
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
	let internalSelectedDataKey = $state<string | null>(untrack(() => defaultSelectedDataKey));
	const selectedDataKey = $derived(
		selectedDataKeyProp === undefined ? internalSelectedDataKey : selectedDataKeyProp
	);
	let hoveredDataKey = $state<string | null>(null);
	let introComplete = $state(false);
	const revealState = { index: null as number | null };
	let brushRange = $state({ start: 0, end: 100 });
	let brushHover = $state({ inside: false, left: false, right: false });
	let loadingData = $state.raw<number[]>(untrack(() => createAreaLoadingData(loadingPoints)));
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

	const chart = setEChartsAreaChartContext();
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

	const areas = $derived(chart.areas.values);
	const effectiveAnimation = $derived(areas[0]?.animationType ?? animationType);
	const seriesKeys = $derived(areas.map((area) => area.dataKey));
	const xAxis = $derived(chart.xAxes.first);
	const yAxis = $derived(chart.yAxes.first);
	const tooltip = $derived(tooltipSlots.first);
	const legend = $derived(legendSlots.first);
	const brush = $derived(brushSlots.first);

	$effect(() => {
		loadingData = createAreaLoadingData(loadingPoints);
	});
	const categoryValues = $derived.by(() => {
		const series = new Set(areas.map((area) => area.dataKey));
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

	function areaOptionContext(): AreaOptionContext {
		return {
			data,
			config,
			areas,
			xDataKey,
			curveType,
			stackType,
			selectedDataKey,
			enableHoverHighlight,
			enableHoverReveal,
			hoverRevealIndex: revealState.index,
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
			animation: animation && !introComplete && effectiveAnimation !== 'none',
			animationType,
			reducedMotion: prefersReducedMotion.current,
			rendererSize: dimension,
			renderStyle,
			ditherVariant,
			ditherCellSize,
			bloom
		};
	}

	const option = $derived.by(() => {
		const built = buildAreaOption(areaOptionContext());
		return (chartOptions ? { ...built, ...chartOptions } : built) as EChartsCoreOption;
	});

	$effect(() => {
		if (isLoading) {
			introComplete = false;
			return;
		}
		if (introComplete || !instance || areas.length === 0) return;
		if (!animation || effectiveAnimation === 'none' || prefersReducedMotion.current) {
			introComplete = true;
			return;
		}
		const timer = window.setTimeout(() => (introComplete = true), 1000);
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
		const keys = seriesKeys;
		const revealEnabled = enableHoverReveal;
		const highlightEnabled = enableHoverHighlight;
		if (!chartInstance) return;
		const renderer = chartInstance.getZr();
		const context = areaOptionContext();
		const tops = computeAreaPlottedTops(context);
		const base = buildAreaOption({ ...context, hoverRevealIndex: null });
		const baseSeries = Array.isArray(base.series) ? base.series : base.series ? [base.series] : [];
		const revealValues = new Map(
			keys.map((key) => {
				const entry = baseSeries.find(
					(series) => String((series as { id?: unknown }).id ?? '') === key
				);
				const values = Array.isArray((entry as { data?: unknown[] } | undefined)?.data)
					? ((entry as { data: unknown[] }).data ?? [])
					: [];
				return [key, values] as const;
			})
		);

		const applyHoverKey = (key: string | null) => {
			if (hoveredDataKey === key) return;
			const previous = hoveredDataKey;
			hoveredDataKey = key;
			if (previous) {
				chartInstance.dispatchAction({ type: 'downplay', seriesId: previous });
				chartInstance.dispatchAction({ type: 'downplay', seriesId: `__buffer-${previous}` });
			}
			if (key) {
				chartInstance.dispatchAction({ type: 'highlight', seriesId: key });
				chartInstance.dispatchAction({ type: 'highlight', seriesId: `__buffer-${key}` });
			}
		};

		const pushReveal = (index: number | null) => {
			const updates = keys.flatMap((key) => {
				const values = revealValues.get(key) ?? [];
				return [
					{
						id: key,
						data:
							index === null
								? values
								: values.map((value, valueIndex) => (valueIndex > index ? null : value))
					},
					{
						id: `__reveal-${key}`,
						data:
							index === null
								? values
								: values.map((value, valueIndex) => (valueIndex < index ? null : value)),
						lineStyle: { opacity: index === null ? 0 : 0.3 }
					}
				];
			});
			chartInstance.setOption({ series: updates }, { silent: true });
			for (const key of keys) {
				chartInstance.dispatchAction(
					index === null
						? { type: 'downplay', seriesId: key }
						: { type: 'highlight', seriesId: key, dataIndex: index }
				);
			}
		};

		const clearReveal = () => {
			if (revealState.index === null) return;
			revealState.index = null;
			pushReveal(null);
		};

		const move = (event: { offsetX?: number; offsetY?: number }) => {
			const x = event.offsetX ?? -1;
			const y = event.offsetY ?? -1;
			if (activeBrush && !isLoading) {
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
			}

			if (revealEnabled) {
				if (!chartInstance.containPixel({ gridIndex: 0 }, [x, y])) {
					clearReveal();
					return;
				}
				const converted = chartInstance.convertFromPixel({ gridIndex: 0 }, [x, y]);
				const raw = Array.isArray(converted) ? converted[0] : converted;
				if (typeof raw !== 'number') return;
				const index = Math.max(0, Math.min(data.length - 1, Math.round(raw)));
				if (index === revealState.index) return;
				revealState.index = index;
				pushReveal(index);
				return;
			}

			if (highlightEnabled && selectedDataKey === null) {
				applyHoverKey(resolveAreaAtPixel(chartInstance, tops, keys, x, y));
			}
		};

		const out = () => {
			brushHover = { inside: false, left: false, right: false };
			if (revealEnabled) clearReveal();
			else if (highlightEnabled) applyHoverKey(null);
		};

		renderer.on('mousemove', move);
		renderer.on('globalout', out);
		return () => {
			renderer.off('mousemove', move);
			renderer.off('globalout', out);
		};
	});

	function toggleSelection(key: string) {
		if (!areas.some((area) => area.dataKey === key && area.isClickable) && !legend?.isClickable) {
			return;
		}
		const next = selectedDataKey === key ? null : key;
		internalSelectedDataKey = next;
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
			let key = eventSeriesKey(params);
			if (instance && params && typeof params === 'object') {
				const event = (params as { event?: { offsetX?: unknown; offsetY?: unknown } }).event;
				if (typeof event?.offsetX === 'number' && typeof event.offsetY === 'number') {
					key =
						resolveAreaAtPixel(
							instance,
							computeAreaPlottedTops(areaOptionContext()),
							seriesKeys,
							event.offsetX,
							event.offsetY
						) ?? key;
				}
			}
			if (key) toggleSelection(key);
		},
		mouseover: (params: unknown) => {
			if (!enableHoverHighlight || enableHoverReveal || selectedDataKey !== null || !instance)
				return;
			const nativeKey = eventSeriesKey(params);
			if (nativeKey && nativeKey !== hoveredDataKey) {
				instance.dispatchAction({ type: 'downplay', seriesId: nativeKey });
				if (hoveredDataKey)
					instance.dispatchAction({ type: 'highlight', seriesId: hoveredDataKey });
			}
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
		const animatedKeys = areas
			.filter((area) => area.strokeVariant === 'animated-dashed' && !area.enableBufferLine)
			.map((area) => area.dataKey);
		if (!chartInstance || isLoading || selectedDataKey !== null || animatedKeys.length === 0)
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
		let frame = 0;
		let lastPhase = 0;
		const start = performance.now();
		const tick = (now: number) => {
			const phase = ((now - start) / 2000) % 1;
			// Change the wave only after the reveal has left the plot. Its geometry
			// therefore stays fixed for the complete visible sweep, like Line loading.
			if (phase < lastPhase) loadingData = createAreaLoadingData(loadingPoints);
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
						(offset, index, values) =>
							index === 0 || offset - (values[index - 1] ?? Number.NEGATIVE_INFINITY) > 0.0001
					)
					.map((offset) => {
						const distance = Math.abs(offset - center);
						const alpha =
							distance >= 0.2 ? 0 : peak * Math.sin(((1 - distance / 0.2) * Math.PI) / 2);
						return { offset, color: withAlpha(color, alpha) };
					});
			const clip = (peak: number) =>
				new echarts.graphic.LinearGradient(0, 0, width, width, stops(peak), true);
			chartInstance.setOption(
				{
					series: [
						{
							id: '__loading',
							data: loadingData,
							lineStyle: { color: clip(0.5), width: 1 },
							areaStyle: { color: clip(0.03) }
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
