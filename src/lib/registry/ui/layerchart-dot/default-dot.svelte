<script lang="ts">
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
</script>

<g class={className} mask={maskId ? `url(#${maskId})` : undefined}>
	<defs>
		<clipPath id={`dot-clip-${dotId}`}>
			<circle {cx} {cy} {r} />
		</clipPath>
	</defs>
	<!-- Full-width gradient rectangle clipped to dot shape -->
	<rect
		x={gradientX}
		y={cy - r}
		width={gradientWidth}
		height={r * 2}
		fill={gradientUrl}
		fill-opacity={fillOpacity}
		clip-path={`url(#dot-clip-${dotId})`}
	/>
</g>
