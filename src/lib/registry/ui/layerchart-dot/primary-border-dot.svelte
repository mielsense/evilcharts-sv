<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { DotVariantProps } from './types.js';

	let {
		cx,
		cy,
		dotId,
		fillOpacity,
		gradientUrl,
		class: className,
		maskId,
		gradientX,
		gradientWidth
	}: DotVariantProps = $props();

	const r = 6;
	const strokeWidth = 5;
</script>

<g class={cn(className, 'text-background')} mask={maskId ? `url(#${maskId})` : undefined}>
	<defs>
		<clipPath id={`dot-clip-${dotId}`}>
			<circle {cx} {cy} {r} />
		</clipPath>
	</defs>
	<!-- Background stroke (border) -->
	<circle {cx} {cy} {r} fill="currentColor" />
	<!-- Inner gradient circle clipped -->
	<rect
		x={gradientX}
		y={cy - (r - strokeWidth / 2)}
		width={gradientWidth}
		height={(r - strokeWidth / 2) * 2}
		fill={gradientUrl}
		fill-opacity={fillOpacity}
		clip-path={`url(#dot-clip-inner-${dotId})`}
	/>
	<defs>
		<clipPath id={`dot-clip-inner-${dotId}`}>
			<circle {cx} {cy} r={r - strokeWidth / 2} />
		</clipPath>
	</defs>
</g>
