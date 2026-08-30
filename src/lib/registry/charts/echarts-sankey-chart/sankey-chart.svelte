<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import type { EChartsCoreOption, EChartsType } from 'echarts/core';
	import { TooltipComponent } from 'echarts/components';
	import { SankeyChart } from 'echarts/charts';
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
	import {
		buildSankeyOption,
		computeNodeDepths,
		computeNodeValues,
		getSankeyRevealDecision,
		mergeSankeyChartOptions,
		sankeyIntroDuration,
		sankeyShimmerStops,
		type IntroState,
		type SankeyOptionContext
	} from './option.js';
	import { setEChartsSankeyChartContext } from './sankey-chart-context.svelte.js';
	import {
		DEFAULT_ITERATIONS,
		DEFAULT_LINK_CURVATURE,
		DEFAULT_NODE_PADDING,
		DEFAULT_NODE_WIDTH,
		LOADING_ANIMATION_DURATION,
		type LinkRegistration,
		type NodeRegistration,
		type SankeyAnimationType,
		type SankeyData,
		type SankeySelection,
		type TooltipRegistration
	} from './types.js';

	echarts.use([SankeyChart, TooltipComponent]);

	let {
		data,
		config,
		children,
		class: className,
		renderer = DEFAULT_ECHARTS_RENDERER,
		nodeWidth = DEFAULT_NODE_WIDTH,
		nodePadding = DEFAULT_NODE_PADDING,
		linkCurvature = DEFAULT_LINK_CURVATURE,
		iterations = DEFAULT_ITERATIONS,
		sort: _sort = true,
		align = 'justify',
		verticalAlign: _verticalAlign = 'justify',
		defaultSelectedNode = null,
		onSelectionChange,
		isLoading = false,
		animation = true,
		animationType = 'default',
		chartOptions,
		accessibility,
		initialDimension = { width: 320, height: 200 }
	}: {
		data: SankeyData;
		config: ChartConfig;
		children?: Snippet;
		class?: string;
		renderer?: EChartsRenderer;
		nodeWidth?: number;
		nodePadding?: number;
		linkCurvature?: number;
		iterations?: number;
		sort?: boolean;
		align?: 'left' | 'justify';
		verticalAlign?: 'justify' | 'top';
		defaultSelectedNode?: string | null;
		onSelectionChange?: (selection: SankeySelection | null) => void;
		isLoading?: boolean;
		animation?: boolean;
		animationType?: SankeyAnimationType;
		chartOptions?: Record<string, unknown>;
		accessibility?: ChartAccessibility;
		initialDimension?: { width: number; height: number };
	} = $props();

	let container = $state<HTMLDivElement>();
	let themeRevision = $state(0);
	let instance = $state.raw<EChartsType>();
	let selectedNode = $state<string | null>(untrack(() => defaultSelectedNode));
	let resolved = $state.raw<ResolvedColors>({
		series: {},
		tokens: {
			mutedForeground: 'rgba(120, 120, 120, 1)',
			border: 'rgba(120, 120, 120, 0.35)',
			foreground: 'rgba(120, 120, 120, 1)',
			background: 'rgba(0, 0, 0, 1)'
		}
	});
	let hasRevealed = false;
	let revealInstance: EChartsType | undefined;

	const chart = setEChartsSankeyChartContext();
	const tooltipSlots = new RegistrationSet<TooltipRegistration>();
	setEChartsSharedSlotContext({
		register(slot, token, getter) {
			if (slot === 'tooltip')
				return tooltipSlots.register(token, getter as () => TooltipRegistration);
			return () => {};
		}
	});

	const node = $derived<NodeRegistration>(
		chart.nodes.first ?? { radius: 0, isClickable: false, label: null }
	);
	const label = $derived(node.label ?? null);
	const link = $derived<LinkRegistration>(
		chart.links.first ?? { variant: 'gradient', verticalPadding: 0 }
	);
	const tooltip = $derived(tooltipSlots.first);
	const nodeValues = $derived(computeNodeValues(data));
	const nodeNames = $derived(data.nodes.map((item) => item.name));

	$effect(() => {
		void themeRevision;
		const host = container;
		const names = nodeNames;
		if (host) resolved = resolveColors(host, config, names);
	});

	function optionContext(intro: IntroState | null): SankeyOptionContext {
		return {
			data,
			config,
			node,
			label,
			link,
			tooltip,
			selectedNode,
			nodeWidth,
			nodePadding,
			linkCurvature,
			iterations,
			align,
			isLoading,
			resolved,
			nodeValues,
			intro
		};
	}

	const option = $derived.by(() => {
		const built = buildSankeyOption(optionContext(null));
		return mergeSankeyChartOptions(built, chartOptions) as EChartsCoreOption;
	});

	function select(name: string) {
		if (!node.isClickable) return;
		selectedNode = selectedNode === name ? null : name;
		onSelectionChange?.(
			selectedNode === null
				? null
				: {
						dataKey: selectedNode,
						value: nodeValues[selectedNode] ?? 0
					}
		);
	}

	const events = $derived({
		click: (params: unknown) => {
			if (!node.isClickable || !params || typeof params !== 'object') return;
			const item = params as { dataType?: string; name?: string };
			if (item.dataType === 'node' && item.name) select(item.name);
		}
	});

	$effect(() => {
		const chartInstance = instance;
		if (!chartInstance) return;
		const lifecycleInputs = [
			config,
			node,
			label,
			link,
			tooltip,
			selectedNode,
			nodeWidth,
			nodePadding,
			linkCurvature,
			iterations,
			align,
			chartOptions
		];
		void lifecycleInputs;
		if (revealInstance !== chartInstance) {
			revealInstance = chartInstance;
			hasRevealed = false;
		}
		const decision = getSankeyRevealDecision({
			hasRevealed,
			isLoading,
			animation,
			animationType,
			reducedMotion: prefersReducedMotion.current
		});
		hasRevealed = decision.hasRevealed;
		if (!decision.shouldReveal) return;
		const depths = computeNodeDepths(data);
		const duration = sankeyIntroDuration(depths);
		let frame = 0;
		const firstFrame = untrack(() =>
			mergeSankeyChartOptions(
				buildSankeyOption(optionContext({ elapsed: 0, depths })),
				chartOptions
			)
		);
		chartInstance.setOption(firstFrame, { notMerge: true });
		const start = performance.now();
		const tick = (now: number) => {
			const elapsed = now - start;
			const intro = elapsed >= duration ? null : { elapsed, depths };
			const frameOption = mergeSankeyChartOptions(
				buildSankeyOption(optionContext(intro)),
				chartOptions
			);
			chartInstance.setOption(frameOption, { silent: true, lazyUpdate: true });
			if (intro) frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
		const chartInstance = instance;
		if (!chartInstance || !isLoading || prefersReducedMotion.current) return;
		let frame = 0;
		const start = performance.now();
		const tick = (now: number) => {
			const phase = ((now - start) / LOADING_ANIMATION_DURATION) % 1;
			const width = chartInstance.getWidth();
			const height = chartInstance.getHeight();
			if (width > 0 && height > 0) {
				const maxT = (width + height) / (2 * width);
				const center = phase * (maxT + 0.44) - 0.22;
				const gradient = (floor: number, peak: number) =>
					new echarts.graphic.LinearGradient(
						0,
						0,
						width,
						width,
						sankeyShimmerStops(center, resolved.tokens.foreground, floor, peak),
						true
					);
				chartInstance.setOption(
					{
						series: [
							{
								id: '__loading',
								itemStyle: { color: gradient(0.1, 0.42), borderWidth: 0 },
								lineStyle: { color: gradient(0.04, 0.16), curveness: DEFAULT_LINK_CURVATURE }
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
</script>

<ChartContainer
	{config}
	{accessibility}
	{initialDimension}
	bind:element={container}
	bind:themeRevision
	aria-busy={isLoading}
	class={className}
>
	{@render children?.()}
	<EChartsHost
		{option}
		{renderer}
		{events}
		setOptionOptions={{ notMerge: false, replaceMerge: ['series'] }}
		bind:instance
	/>
	{#if node.isClickable}
		<div class="sr-only" aria-label="Chart values">
			{#each data.nodes as item (item.name)}
				<button
					type="button"
					aria-pressed={selectedNode === item.name}
					onclick={() => select(item.name)}>{item.name}: {nodeValues[item.name] ?? 0}</button
				>
			{/each}
		</div>
	{/if}
	<LoadingIndicator {isLoading} />
</ChartContainer>
