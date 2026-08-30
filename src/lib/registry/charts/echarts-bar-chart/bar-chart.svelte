<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import { untrack, type Snippet } from 'svelte';
	import type { EChartsCoreOption, EChartsType } from 'echarts/core';
	import {
		AriaComponent,
		DataZoomComponent,
		GridComponent,
		MarkLineComponent,
		TooltipComponent
	} from 'echarts/components';
	import { BarChart, CustomChart } from 'echarts/charts';
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
	import { setEChartsBarChartContext } from './bar-chart-context.svelte.js';
	import {
		buildBarOption,
		createBarLoadingData,
		measureBarValueScale,
		measureBarWidth,
		type BarOptionContext
	} from './option.js';
	import type {
		BrushRegistration,
		BarLayout,
		LegendRegistration,
		BarAnimationType,
		BarHoverDatum,
		StackType,
		TooltipRegistration
	} from './types.js';

	echarts.use([
		BarChart,
		CustomChart,
		GridComponent,
		TooltipComponent,
		DataZoomComponent,
		MarkLineComponent,
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
		stackType = 'default',
		layout = 'vertical',
		barRadius = 2,
		barGap,
		barCategoryGap,
		animation = true,
		animationType = 'left-to-right',
		enableMaxValueHighlight = false,
		referenceLine = null,
		referenceLineFormatter,
		onDataHover,
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
		stackType?: StackType;
		layout?: BarLayout;
		barRadius?: number;
		barGap?: number;
		barCategoryGap?: number;
		animation?: boolean;
		animationType?: BarAnimationType;
		enableMaxValueHighlight?: boolean;
		referenceLine?: number | null;
		referenceLineFormatter?: (value: number) => string;
		onDataHover?: (datum: BarHoverDatum | null) => void;
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
	let layoutMetrics = $state.raw({
		valuePxPerUnit: null as number | null,
		barWidthPx: null as number | null
	});
	const expand = {
		key: null as string | null,
		hovered: null as number | null,
		progress: new Map<number, number>()
	};
	let expandFrame = 0;
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

	const chart = setEChartsBarChartContext();
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
	const selectableSeries = $derived(
		bars
			.filter((bar) => bar.isClickable)
			.filter((bar, index, all) => all.findIndex((item) => item.dataKey === bar.dataKey) === index)
			.map((bar) => ({
				key: bar.dataKey,
				label:
					typeof config[bar.dataKey]?.label === 'string'
						? (config[bar.dataKey].label as string)
						: bar.dataKey
			}))
	);
	const effectiveAnimation = $derived(bars[0]?.animationType ?? animationType);
	const seriesKeys = $derived(bars.map((bar) => bar.dataKey));
	const xAxis = $derived(chart.xAxes.first);
	const yAxis = $derived(chart.yAxes.first);
	const tooltip = $derived(tooltipSlots.first);
	const legend = $derived(legendSlots.first);
	const brush = $derived(brushSlots.first);
	let loadingData = $state.raw<number[]>(untrack(() => createBarLoadingData(loadingBars)));
	$effect(() => {
		loadingData = createBarLoadingData(loadingBars);
	});
	const categoryValues = $derived.by(() => {
		const series = new Set(bars.map((bar) => bar.dataKey));
		const axis = layout === 'vertical' ? xAxis : yAxis;
		const key =
			xDataKey ?? axis?.dataKey ?? Object.keys(data[0] ?? {}).find((item) => !series.has(item));
		return data.map((row, index) => String((key ? row[key] : undefined) ?? index));
	});

	$effect(() => {
		void themeRevision;
		const host = container;
		const keys = seriesKeys;
		if (!host) return;
		resolved = resolveColors(host, config, keys);
	});

	function barOptionContext(): BarOptionContext {
		return {
			data,
			config,
			bars,
			xDataKey,
			stackType,
			layout,
			barRadius,
			barGap,
			barCategoryGap,
			selectedDataKey,
			enableMaxValueHighlight,
			referenceLine,
			referenceLineFormatter,
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
			bloom,
			valuePxPerUnit: layoutMetrics.valuePxPerUnit,
			barWidthPx: layoutMetrics.barWidthPx,
			expand
		};
	}

	const option = $derived.by(() => {
		const built = buildBarOption(barOptionContext());
		return mergeLifecycleOptions(built, chartOptions) as EChartsCoreOption;
	});

	$effect(() => {
		if (isLoading) {
			introComplete = false;
			return;
		}
		if (introComplete || !instance || bars.length === 0) return;
		if (!animation || effectiveAnimation === 'none' || prefersReducedMotion.current) {
			introComplete = true;
			return;
		}
		const timer = window.setTimeout(
			() => (introComplete = true),
			500 + Math.max(0, data.length - 1) * 50
		);
		return () => window.clearTimeout(timer);
	});

	$effect(() => {
		const chartInstance = instance;
		if (!chartInstance) return;
		if (!brush || isLoading || layout === 'horizontal') {
			syncBrushOverlay(chartInstance, brushOverlayStore, null);
			return;
		}
		const last = Math.max(0, categoryValues.length - 1);
		const startIndex = Math.round((brushRange.start / 100) * last);
		const endIndex = Math.round((brushRange.end / 100) * last);
		const format = brush.formatLabel ?? ((value: string) => value);
		syncBrushOverlay(chartInstance, brushOverlayStore, {
			range: brushRange,
			geom: { bottom: legend?.verticalAlign === 'bottom' ? 34 : 6, height: brush.height ?? 56 },
			size: dimension,
			tokens: resolved.tokens,
			labels: {
				start: format(categoryValues[startIndex] ?? '', startIndex),
				end: format(categoryValues[endIndex] ?? '', endIndex)
			},
			showLabels: brushHover.inside && Boolean(brush.formatLabel),
			hover: brushHover
		});
	});

	$effect(() => {
		const chartInstance = instance;
		const activeBrush = brush;
		const currentLegend = legend;
		const currentLayout = layout;
		const expandable = bars.find((bar) => bar.variant === 'expandable');
		const hasBlocks = bars.some((bar) => bar.variant === 'blocks');
		const hasStripped = bars.some((bar) => bar.variant === 'stripped');
		const needsValueScale = hasStripped || (stackType !== 'default' && bars.length > 1);
		if (!chartInstance) return;
		const renderer = chartInstance.getZr();

		const syncHover = (x: number, y: number) => {
			if (activeBrush && !isLoading && currentLayout === 'vertical') {
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

			if (!expandable) return;
			const point = [x, y];
			let next: number | null = null;
			if (chartInstance.containPixel({ gridIndex: 0 }, point)) {
				const converted = chartInstance.convertFromPixel({ gridIndex: 0 }, point);
				const raw = Array.isArray(converted) ? converted[0] : converted;
				if (typeof raw === 'number') next = Math.round(raw);
			}
			animateExpandable(expandable.dataKey, next);
		};

		const move = (event: { offsetX?: number; offsetY?: number }) =>
			syncHover(event.offsetX ?? -1, event.offsetY ?? -1);
		const out = () => {
			brushHover = { inside: false, left: false, right: false };
			if (expandable) animateExpandable(expandable.dataKey, null);
		};
		const finished = () => {
			let nextValue = layoutMetrics.valuePxPerUnit;
			let nextWidth = layoutMetrics.barWidthPx;
			if (needsValueScale && (introComplete || !animation || isLoading)) {
				nextValue = measureBarValueScale(chartInstance, currentLayout === 'horizontal');
			}
			if (hasBlocks) {
				nextWidth = measureBarWidth(chartInstance, currentLayout === 'horizontal', barCategoryGap);
			}
			if (
				(nextValue !== null &&
					(layoutMetrics.valuePxPerUnit === null ||
						Math.abs(nextValue - layoutMetrics.valuePxPerUnit) > 0.5)) ||
				(nextWidth !== null &&
					(layoutMetrics.barWidthPx === null ||
						Math.abs(nextWidth - layoutMetrics.barWidthPx) > 0.5))
			) {
				layoutMetrics = { valuePxPerUnit: nextValue, barWidthPx: nextWidth };
			}
		};

		renderer.on('mousemove', move);
		renderer.on('globalout', out);
		chartInstance.on('finished', finished);
		return () => {
			renderer.off('mousemove', move);
			renderer.off('globalout', out);
			if (!chartInstance.isDisposed()) chartInstance.off('finished', finished);
			if (expandFrame) {
				cancelAnimationFrame(expandFrame);
				expandFrame = 0;
			}
		};
	});

	function renderExpandableSeries(key: string): boolean {
		const chartInstance = instance;
		if (!chartInstance || chartInstance.isDisposed()) return false;
		const built = buildBarOption(barOptionContext());
		const all = Array.isArray(built.series) ? built.series : built.series ? [built.series] : [];
		const series = all.find((entry) => String((entry as { id?: unknown }).id ?? '') === key);
		if (!series) return false;
		chartInstance.setOption({ series: [series] }, { silent: true, lazyUpdate: true });
		return true;
	}

	function snapExpandableToReducedMotion(key: string) {
		expand.progress.clear();
		if (expand.hovered !== null) expand.progress.set(expand.hovered, 1);
		renderExpandableSeries(key);
	}

	function animateExpandable(key: string, index: number | null) {
		if (expand.hovered === index && expand.key === key) return;
		expand.key = key;
		expand.hovered = index;
		if (prefersReducedMotion.current) {
			snapExpandableToReducedMotion(key);
			return;
		}
		if (index !== null && !expand.progress.has(index)) expand.progress.set(index, 0.12);
		if (expandFrame) return;
		let previous = performance.now();
		const tick = (now: number) => {
			const chartInstance = instance;
			if (!chartInstance || chartInstance.isDisposed()) {
				expandFrame = 0;
				return;
			}
			if (prefersReducedMotion.current) {
				snapExpandableToReducedMotion(key);
				expandFrame = 0;
				return;
			}
			const factor = 1 - Math.exp(-Math.min(64, now - previous) / 70);
			previous = now;
			let moving = false;
			for (const [datumIndex, current] of expand.progress) {
				const target = datumIndex === expand.hovered ? 1 : 0.12;
				const next = current + (target - current) * factor;
				if (Math.abs(target - next) < 0.004) {
					if (target === 0.12) expand.progress.delete(datumIndex);
					else expand.progress.set(datumIndex, target);
				} else {
					expand.progress.set(datumIndex, next);
					moving = true;
				}
			}
			if (!renderExpandableSeries(key)) {
				expandFrame = 0;
				return;
			}
			expandFrame = moving ? requestAnimationFrame(tick) : 0;
		};
		expandFrame = requestAnimationFrame(tick);
	}

	$effect(() => {
		const chartInstance = instance;
		const index = tooltip?.defaultIndex;
		if (!chartInstance || isLoading || index === undefined) return;
		const timer = window.setTimeout(() => {
			if (!chartInstance.isDisposed()) {
				chartInstance.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: index });
			}
		}, 300);
		return () => window.clearTimeout(timer);
	});

	function toggleSelection(key: string) {
		if (!bars.some((bar) => bar.dataKey === key && bar.isClickable) && !legend?.isClickable) {
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

	function eventDataIndex(params: unknown): number | null {
		if (!params || typeof params !== 'object') return null;
		const index = (params as { dataIndex?: unknown }).dataIndex;
		return typeof index === 'number' && Number.isInteger(index) ? index : null;
	}

	const events = $derived({
		click: (params: unknown) => {
			const key = eventSeriesKey(params);
			if (key) toggleSelection(key);
		},
		mouseover: (params: unknown) => {
			const index = eventDataIndex(params);
			onDataHover?.(index === null || !data[index] ? null : { index, row: data[index] });
			if (selectedDataKey !== null) return;
			hoveredDataKey = eventSeriesKey(params);
		},
		mouseout: () => {
			hoveredDataKey = null;
			onDataHover?.(null);
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
		if (!chartInstance || !isLoading) return;
		if (prefersReducedMotion.current) {
			chartInstance.setOption(
				{
					series: [
						{
							id: '__loading',
							data: loadingData,
							itemStyle: { color: withAlpha(resolved.tokens.foreground, 0.22) }
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
			if (phase < lastPhase) loadingData = createBarLoadingData(loadingBars);
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
			const stops = [0, center - 0.2, center, center + 0.2, 1]
				.filter((offset) => offset >= 0 && offset <= 1)
				.sort((left, right) => left - right)
				.filter((offset, index, all) => index === 0 || offset - (all[index - 1] ?? -1) > 0.0001)
				.map((offset) => {
					const distance = Math.abs(offset - center);
					const alpha = distance >= 0.2 ? 0 : 0.22 * Math.sin(((1 - distance / 0.2) * Math.PI) / 2);
					return { offset, color: withAlpha(color, alpha) };
				});
			chartInstance.setOption(
				{
					series: [
						{
							id: '__loading',
							itemStyle: {
								color: new echarts.graphic.LinearGradient(0, 0, width, width, stops, true)
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
	{#if bars.length > 0}
		<EChartsHost {option} {renderer} {events} bind:instance />
	{/if}
	{#if !legend?.isClickable}
		<SelectableSeriesControls
			items={selectableSeries}
			selectedKey={selectedDataKey}
			onToggle={toggleSelection}
		/>
	{/if}
	{#if brush && !isLoading && data.length > 0 && layout === 'vertical'}
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
