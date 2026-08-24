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

	const r = 3;
	const strokeWidth = 1;
</script>

<g class={cn(className, 'text-background')} mask={maskId ? `url(#${maskId})` : undefined}>
	<defs>
		<clipPath id={`dot-clip-${dotId}`}>
			<circle {cx} {cy} r={r + strokeWidth / 2} />
		</clipPath>
	</defs>
	<!-- Gradient stroke (border) via clipped rect -->
	<rect
		x={gradientX}
		y={cy - r - strokeWidth / 2}
		width={gradientWidth}
		height={(r + strokeWidth / 2) * 2}
		fill={gradientUrl}
		fill-opacity={fillOpacity}
		clip-path={`url(#dot-clip-${dotId})`}
	/>
	<!-- Inner solid fill -->
	<circle {cx} {cy} r={r - strokeWidth / 2} fill="currentColor" />
</g>
