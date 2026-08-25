<script lang="ts">
	import { Tooltip } from 'layerchart';
	import type { ComponentProps, Snippet } from 'svelte';
	import { useChart } from '../layerchart-chart/index.js';

	type Props = Omit<ComponentProps<typeof Tooltip.Root>, 'children' | 'variant'> & {
		children: Snippet<[{ data: unknown }]>;
	};

	let { children: content, props, ...restProps }: Props = $props();

	const { chartId } = useChart();
</script>

<!-- `variant="none"` drops LayerChart's own tooltip chrome so <ChartTooltipContent> owns the
     entire look, matching the reference where Recharts' `<Tooltip content>` replaces the
     default box. Position motion is left at LayerChart's default spring.

     LayerChart's default body portal escapes overflow boundaries. Repeating the chart's
     `data-chart` value on the portaled root keeps the scoped `--color-*` variables available. -->
<Tooltip.Root
	variant="none"
	{...restProps}
	props={{ ...props, root: { ...props?.root, 'data-chart': chartId } }}
>
	{#snippet children({ data })}
		{@render content({ data })}
	{/snippet}
</Tooltip.Root>
