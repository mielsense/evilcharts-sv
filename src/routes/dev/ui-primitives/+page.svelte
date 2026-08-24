<script lang="ts">
	// Development-only gallery. Renders every variant of the shared UI primitives so their
	// geometry and colour can be eyeballed in both themes. The authoritative comparison against
	// the reference happens through the chart examples, because the reference's
	// /docs/recharts/ui/* pages render full charts rather than bare primitives.
	import { ChartContainer, type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';
	import { ChartBackground } from '$lib/registry/ui/layerchart-background/index.js';
	import { ChartDot } from '$lib/registry/ui/layerchart-dot/index.js';
	import { ChartLegendContent } from '$lib/registry/ui/layerchart-legend/index.js';
	import { ChartTooltipContent } from '$lib/registry/ui/layerchart-tooltip/index.js';
	import { PATTERN_MAP } from '$lib/registry/ui/layerchart-background/pattern-map.js';
	import type { BackgroundVariant } from '$lib/registry/ui/layerchart-background/types.js';
	import type { ChartLegendVariant } from '$lib/registry/ui/layerchart-legend/types.js';
	import type { DotVariant } from '$lib/registry/ui/layerchart-dot/types.js';

	const config = {
		desktop: { label: 'Desktop', colors: { light: ['#047857'], dark: ['#10b981'] } },
		mobile: { label: 'Mobile', colors: { light: ['#be123c', '#f43f5e'], dark: ['#f43f5e'] } }
	} satisfies ChartConfig;

	const backgrounds = Object.keys(PATTERN_MAP) as BackgroundVariant[];

	const legendVariants: ChartLegendVariant[] = [
		'square',
		'circle',
		'circle-outline',
		'rounded-square',
		'rounded-square-outline',
		'vertical-bar',
		'horizontal-bar'
	];

	const dotVariants: DotVariant[] = ['default', 'border', 'colored-border'];

	const legendPayload = [{ dataKey: 'desktop' }, { dataKey: 'mobile' }];

	const tooltipPayload = [
		{ dataKey: 'desktop', name: 'desktop', value: 1234, payload: { month: 'January' } },
		{ dataKey: 'mobile', name: 'mobile', value: 567, payload: { month: 'January' } }
	];
</script>

<div class="min-h-dvh space-y-10 bg-sidebar p-8 text-xs" data-preview-ready="true">
	<section>
		<h2 class="mb-3 font-mono text-sm text-foreground">Backgrounds ({backgrounds.length})</h2>
		<div class="grid grid-cols-4 gap-3">
			{#each backgrounds as variant (variant)}
				<div class="overflow-hidden rounded-[5px] border bg-background">
					<div class="border-b px-2 py-1 font-mono text-muted-foreground">{variant}</div>
					<svg viewBox="0 0 200 100" class="h-24 w-full" data-bg={variant}>
						<ChartBackground {variant} />
					</svg>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="mb-3 font-mono text-sm text-foreground">
			Legend variants ({legendVariants.length})
		</h2>
		<div class="grid grid-cols-2 gap-3">
			{#each legendVariants as variant (variant)}
				<ChartContainer {config} class="!aspect-auto rounded-[5px] border bg-background px-3">
					<div class="pt-2 font-mono text-muted-foreground">{variant}</div>
					<ChartLegendContent {variant} payload={legendPayload} align="left" isClickable />
				</ChartContainer>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="mb-3 font-mono text-sm text-foreground">Dot variants ({dotVariants.length})</h2>
		<ChartContainer {config} id="dots" class="!aspect-auto rounded-[5px] border bg-background p-3">
			<div class="grid grid-cols-3 gap-3">
				{#each dotVariants as type (type)}
					<div>
						<div class="pb-1 font-mono text-muted-foreground">{type}</div>
						<svg viewBox="0 0 60 30" class="h-16 w-full">
							<defs>
								<linearGradient id="chart-dots-colors-desktop" x1="0" y1="0" x2="1" y2="0">
									<stop offset="0%" stop-color="var(--color-desktop-0)" />
									<stop offset="100%" stop-color="var(--color-mobile-0)" />
								</linearGradient>
							</defs>
							<ChartDot cx={30} cy={15} dataKey="desktop" chartId="chart-dots" {type} />
						</svg>
					</div>
				{/each}
			</div>
		</ChartContainer>
	</section>

	<section>
		<h2 class="mb-3 font-mono text-sm text-foreground">Tooltip variants</h2>
		<div class="grid grid-cols-2 gap-3">
			{#each [{ variant: 'default', roundness: 'lg' }, { variant: 'frosted-glass', roundness: 'lg' }] as const as combo (combo.variant)}
				<ChartContainer
					{config}
					class="!aspect-auto items-start rounded-[5px] border bg-background p-3"
				>
					<div class="pb-2 font-mono text-muted-foreground">{combo.variant}</div>
					<ChartTooltipContent
						active
						payload={tooltipPayload}
						label="January"
						variant={combo.variant}
						roundness={combo.roundness}
					/>
				</ChartContainer>
			{/each}
			{#each ['dot', 'line', 'dashed'] as const as indicator (indicator)}
				<ChartContainer
					{config}
					class="!aspect-auto items-start rounded-[5px] border bg-background p-3"
				>
					<div class="pb-2 font-mono text-muted-foreground">indicator={indicator}</div>
					<ChartTooltipContent active payload={tooltipPayload} label="January" {indicator} />
				</ChartContainer>
			{/each}
		</div>
	</section>
</div>
