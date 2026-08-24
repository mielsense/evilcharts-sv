<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';
	import { validateChartConfigColors, type ChartConfig } from './chart-config.js';
	import { setChartContext } from './chart-context.svelte.js';
	import ChartStyle from './chart-style.svelte';

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		config: ChartConfig;
		children?: Snippet;
		/** Size used before the container has been measured. */
		initialDimension?: { width: number; height: number };
		/** Optional content rendered below the chart (e.g. EvilBrush) */
		footer?: Snippet;
	};

	let {
		id,
		config,
		initialDimension = { width: 320, height: 200 },
		class: className,
		children,
		footer,
		...restProps
	}: Props = $props();

	const uniqueId = $props.id();
	const chartId = $derived(`chart-${id ?? uniqueId}`);

	// Validate chart config at runtime
	$effect.pre(() => {
		validateChartConfigColors(config);
	});

	setChartContext({
		get config() {
			return config;
		},
		get chartId() {
			return chartId;
		},
		get initialDimension() {
			return initialDimension;
		}
	});
</script>

<div
	data-slot="chart"
	data-chart={chartId}
	class={cn(
		'min-h-0 w-full flex-1',
		// Reference equivalents, retargeted from Recharts' `.recharts-*` hooks onto
		// LayerChart's `.lc-*` hooks. See plans/DEVIATIONS.md U-1.
		/*
			The grid and rule overrides are gated on `:not([stroke])`, mirroring the reference's
			`[&_.recharts-cartesian-grid_line[stroke='#ccc']]` / `[&_.recharts-polar-grid_[stroke='#ccc']]`
			selectors: they restyle only marks still carrying the library's *default* stroke and leave
			an explicitly-set one alone. Without the gate they also repainted the radar's polar grid,
			which sets `stroke="currentColor"` itself, washing the web out to `border/50`.
		*/
		"relative flex flex-col justify-center text-xs [&_.lc-arc-track]:fill-muted [&_.lc-axis-label]:[stroke:none] [&_.lc-axis-label]:text-xs [&_.lc-axis-label]:font-normal [&_.lc-axis-tick-label]:fill-muted-foreground [&_.lc-axis-tick-label]:[stroke:none] [&_.lc-axis-tick-label]:text-xs [&_.lc-axis-tick-label]:font-normal [&_.lc-grid-x-line:not([stroke])]:stroke-border/50 [&_.lc-grid-x-radial-line:not([stroke])]:stroke-border [&_.lc-grid-y-line:not([stroke])]:stroke-border/50 [&_.lc-grid-y-radial-circle:not([stroke])]:stroke-border [&_.lc-highlight-bar]:fill-muted [&_.lc-highlight-line]:stroke-border [&_.lc-highlight-point[stroke='#fff']]:stroke-transparent [&_.lc-layer]:outline-hidden [&_.lc-layout-svg]:outline-hidden [&_.lc-pie-arc]:outline-hidden [&_.lc-pie-arc[stroke='#fff']]:stroke-transparent [&_.lc-rule-x-line:not([stroke])]:stroke-border [&_.lc-rule-y-line:not([stroke])]:stroke-border",
		!footer && 'aspect-video',
		className
	)}
	{...restProps}
>
	<ChartStyle id={chartId} {config} />
	<div class="flex min-h-0 w-full flex-1 flex-col">
		{@render children?.()}
	</div>
	{@render footer?.()}
</div>
