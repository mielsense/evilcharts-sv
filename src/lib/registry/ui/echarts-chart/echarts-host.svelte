<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { EChartsCoreOption, EChartsType, SetOptionOpts } from 'echarts/core';
	import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';
	import * as echarts from 'echarts/core';
	import { cn } from '$lib/utils.js';
	import type { EChartsRenderer } from './types.js';

	// Register renderers in the module that calls `echarts.init`. Keeping this beside the runtime
	// use prevents production tree-shaking from dropping a side-effect-only barrel registration.
	echarts.use([CanvasRenderer, SVGRenderer]);

	export type EChartsEventHandler = (params: unknown) => void;

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		option: EChartsCoreOption;
		renderer: EChartsRenderer;
		instance?: EChartsType;
		events?: Record<string, EChartsEventHandler>;
		setOptionOptions?: SetOptionOpts;
		hideSource?: boolean;
	};

	let {
		option,
		renderer,
		instance = $bindable(),
		events = {},
		setOptionOptions = { notMerge: true, lazyUpdate: false },
		hideSource = false,
		class: className,
		...restProps
	}: Props = $props();

	function createChartAttachment(activeRenderer: EChartsRenderer) {
		return (node: HTMLDivElement) => {
			const chart = echarts.init(node, undefined, { renderer: activeRenderer });
			instance = chart;
			const resizeObserver = new ResizeObserver(() => {
				if (node.clientWidth === chart.getWidth() && node.clientHeight === chart.getHeight())
					return;
				chart.resize();
			});
			resizeObserver.observe(node);

			return () => {
				resizeObserver.disconnect();
				chart.dispose();
				if (instance === chart) instance = undefined;
			};
		};
	}

	$effect(() => {
		const chart = instance;
		const nextOption = option;
		const options = setOptionOptions;
		if (!chart || chart.isDisposed()) return;
		chart.setOption(nextOption, options);
	});

	$effect(() => {
		const chart = instance;
		const bindings = Object.entries(events);
		if (!chart || chart.isDisposed()) return;
		for (const [event, handler] of bindings) chart.on(event, handler);
		return () => {
			if (chart.isDisposed()) return;
			for (const [event, handler] of bindings) chart.off(event, handler);
		};
	});
</script>

<div
	{@attach createChartAttachment(renderer)}
	data-slot="echarts-host"
	data-echarts-source-hidden={hideSource || undefined}
	class={cn(
		'absolute inset-0 min-h-0 min-w-0',
		hideSource && '[&_canvas]:opacity-0 [&_svg]:opacity-0',
		className
	)}
	{...restProps}
></div>
