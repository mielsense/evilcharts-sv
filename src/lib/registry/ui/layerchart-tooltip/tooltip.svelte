<script lang="ts">
	import { Tooltip } from 'layerchart';
	import type { ComponentProps, Snippet } from 'svelte';

	type Props = Omit<ComponentProps<typeof Tooltip.Root>, 'children' | 'variant'> & {
		children: Snippet<[{ data: unknown }]>;
	};

	let { children: content, ...restProps }: Props = $props();
</script>

<!-- `variant="none"` drops LayerChart's own tooltip chrome so <ChartTooltipContent> owns the
     entire look, matching the reference where Recharts' `<Tooltip content>` replaces the
     default box. Position motion is left at LayerChart's default spring.

     `portal={false}` keeps the tooltip inside the chart's DOM. LayerChart portals to
     `document.body` by default, which puts the tooltip outside the `[data-chart]` element that
     scopes the `--color-*` custom properties, so every colour indicator painted from them came out
     transparent. Recharts renders its tooltip inside the chart wrapper for the same reason. -->
<Tooltip.Root variant="none" portal={false} {...restProps}>
	{#snippet children({ data })}
		{@render content({ data })}
	{/snippet}
</Tooltip.Root>
