<script lang="ts" generics="TData extends Record<string, unknown>">
	import { prefersReducedMotion } from 'svelte/motion';
	import { untrack, type Snippet } from 'svelte';
	import type { EChartsCoreOption, EChartsType } from 'echarts/core';
	import { AriaComponent, TooltipComponent } from 'echarts/components';
	import { PieChart } from 'echarts/charts';
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
	import { setEChartsPieChartContext } from './pie-chart-context.svelte.js';
	import { buildPieOption, createPieLoadingFrame } from './option.js';
	import BackgroundOverlay from './background-overlay.svelte';
	import {
		LOADING_ANIMATION_DURATION,
		REVEAL_DURATION,
		type DitherBloom,
		type LegendRegistration,
		type TooltipRegistration
	} from './types.js';

	echarts.use([PieChart, TooltipComponent, AriaComponent]);

	let {
		data,
		config,
		dataKey,
		nameKey,
		class: className,
		renderer = DEFAULT_ECHARTS_RENDERER,
		animation = true,
		renderStyle = 'native',
		ditherVariant = 'gradient',
		ditherCellSize = 2,
		bloom = 'off',
		defaultSelectedSector = null,
		selectedSector: selectedSectorProp,
		onSelectionChange,
		isLoading = false,
		chartOptions,
		accessibility,
		children
	}: {
		data: TData[];
		config: ChartConfig;
		dataKey: keyof TData & string;
		nameKey: keyof TData & string;
		class?: string;
		renderer?: EChartsRenderer;
		animation?: boolean;
		renderStyle?: RenderStyle;
		ditherVariant?: DitherVariant;
		ditherCellSize?: number;
		bloom?: DitherBloom;
		defaultSelectedSector?: string | null;
		selectedSector?: string | null;
		onSelectionChange?: (selection: { dataKey: string; value: number } | null) => void;
		isLoading?: boolean;
		chartOptions?: Record<string, unknown>;
		accessibility?: ChartAccessibility;
		children?: Snippet;
	} = $props();

	let container = $state<HTMLDivElement>();
	let instance = $state.raw<EChartsType>();
	let themeRevision = $state(0);
	let dimension = $state({ width: 320, height: 200 });
	let internalSelectedSector = $state<string | null>(untrack(() => defaultSelectedSector));
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

	const selectedSector = $derived(
		selectedSectorProp === undefined ? internalSelectedSector : selectedSectorProp
	);
	const chart = setEChartsPieChartContext();
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

	const pie = $derived(chart.pies.first);
	const background = $derived(chart.backgrounds.first);
	const tooltip = $derived(tooltipSlots.first);
	const legend = $derived(legendSlots.first);
	const sectorKeys = $derived(data.map((row) => String(row[nameKey])));

	$effect(() => {
		void themeRevision;
		const host = container;
		const keys = sectorKeys;
		if (host) resolved = resolveColors(host, config, keys);
	});

	const option = $derived.by(() => {
		const revealEnabled = animation && !hasRevealed && !isLoading && !prefersReducedMotion.current;
		const built = buildPieOption({
			data: data as Record<string, unknown>[],
			config,
			dataKey,
			nameKey,
			pie,
			selectedSector,
			tooltip,
			legend,
			isLoading,
			resolved,
			animation: revealEnabled,
			reducedMotion: prefersReducedMotion.current,
			renderStyle,
			ditherVariant,
			ditherCellSize,
			bloom,
			rendererSize: dimension
		});
		return {
			...(chartOptions ? { ...built, ...chartOptions } : built),
			animation: revealEnabled,
			animationDuration: REVEAL_DURATION,
			animationDurationUpdate: 0
		} as EChartsCoreOption;
	});

	function selectSector(name: string | null) {
		if (selectedSectorProp === undefined) internalSelectedSector = name;
		if (name === null) {
			onSelectionChange?.(null);
			return;
		}
		const row = data.find((item) => String(item[nameKey]) === name);
		onSelectionChange?.(row ? { dataKey: name, value: Number(row[dataKey]) || 0 } : null);
	}

	function toggleSector(name: string) {
		selectSector(selectedSector === name ? null : name);
	}

	const events = $derived({
		click: (params: unknown) => {
			const event = params as { name?: unknown; seriesId?: unknown } | null;
			if (!event || String(event.seriesId ?? '').startsWith('__')) return;
			if (pie?.isClickable && typeof event.name === 'string') toggleSector(event.name);
		}
	});

	$effect(() => {
		const chartInstance = instance;
		const pieSlot = pie;
		if (isLoading) {
			hasRevealed = false;
			return;
		}
		if (!chartInstance || !pieSlot || hasRevealed) return;
		const frame = requestAnimationFrame(() => {
			hasRevealed = true;
		});
		return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
		const chartInstance = instance;
		if (!chartInstance || isLoading || tooltip?.defaultIndex === undefined) return;
		const frame = requestAnimationFrame(() => {
			chartInstance.dispatchAction({
				type: 'showTip',
				seriesIndex: 0,
				dataIndex: tooltip.defaultIndex
			});
		});
		return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
		const chartInstance = instance;
		if (!chartInstance || !isLoading) return;
		const cornerRadius = pie?.cornerRadius ?? 0;
		const paddingAngle = pie?.paddingAngle ?? 0;
		let frame = 0;
		const startedAt = performance.now();
		const tick = (now: number) => {
			const center = ((((now - startedAt) / LOADING_ANIMATION_DURATION) % 1) + 1) % 1;
			const data = createPieLoadingFrame({
				center,
				foreground: resolved.tokens.foreground,
				background: resolved.tokens.background,
				cornerRadius,
				paddingAngle
			});
			chartInstance.setOption(
				{ series: [{ id: '__loading', data }] },
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
	{#if background && !isLoading}<BackgroundOverlay variant={background.variant} />{/if}
	<EChartsHost {option} {renderer} {events} bind:instance />
	{#if legend && !isLoading}
		<LegendOverlay
			seriesKeys={sectorKeys}
			{config}
			variant={legend.variant}
			align={legend.align}
			selectedKey={selectedSector}
			hoveredKey={null}
			isClickable={legend.isClickable}
			onToggle={toggleSector}
			style={legendStyle}
		/>
	{/if}
	<LoadingIndicator {isLoading} />
</ChartContainer>
