<script lang="ts">
	// Development-only harness for the brush footer, covering all three mini-chart variants
	// plus the controlled range wiring `EvilBrushState` provides to a chart root.
	import { ChartContainer, type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';
	import { EvilBrush, EvilBrushState } from '$lib/registry/ui/layerchart-brush/index.js';
	import type { EvilBrushVariant } from '$lib/registry/ui/layerchart-brush/types.js';

	const config = {
		desktop: { label: 'Desktop', colors: { light: ['#047857'], dark: ['#10b981'] } },
		mobile: { label: 'Mobile', colors: { light: ['#be123c'], dark: ['#f43f5e'] } }
	} satisfies ChartConfig;

	const data = Array.from({ length: 30 }, (_, i) => ({
		date: `June ${i + 1}`,
		desktop: 400 + Math.round(Math.sin(i / 3) * 250 + i * 8),
		mobile: 260 + Math.round(Math.cos(i / 4) * 160 + i * 6)
	}));

	const variants: EvilBrushVariant[] = ['area', 'line', 'bar'];

	const brush = new EvilBrushState({ data: () => data });
</script>

<div class="min-h-dvh space-y-8 bg-sidebar p-8 text-xs" data-preview-ready="true">
	{#each variants as variant (variant)}
		<section>
			<h2 class="mb-2 font-mono text-sm text-foreground">variant={variant}</h2>
			<ChartContainer {config} class="!aspect-auto rounded-[5px] border bg-background p-3">
				{#snippet footer()}
					<EvilBrush
						{data}
						chartConfig={config}
						xDataKey="date"
						{variant}
						stacked={variant !== 'line'}
						curveType="monotone"
						skipStyle
						class="mt-1"
						formatLabel={(value) => String(value)}
					/>
				{/snippet}
			</ChartContainer>
		</section>
	{/each}

	<section>
		<h2 class="mb-2 font-mono text-sm text-foreground">
			controlled via EvilBrushState — visible rows: {brush.visibleData.length}
			({brush.range.startIndex}…{brush.range.endIndex})
		</h2>
		<ChartContainer {config} class="!aspect-auto rounded-[5px] border bg-background p-3">
			{#snippet footer()}
				<EvilBrush
					{data}
					chartConfig={config}
					xDataKey="date"
					variant="area"
					height={56}
					stacked
					skipStyle
					class="mt-1"
					startIndex={brush.brushProps.startIndex}
					endIndex={brush.brushProps.endIndex}
					onChange={brush.brushProps.onChange}
					formatLabel={(value) => String(value).replace('June ', '')}
				/>
			{/snippet}
		</ChartContainer>
		<pre class="mt-2 font-mono text-muted-foreground">{JSON.stringify(brush.range)} first={brush
				.visibleData[0]?.date} last={brush.visibleData.at(-1)?.date}</pre>
	</section>
</div>
