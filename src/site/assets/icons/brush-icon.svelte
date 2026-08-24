<script lang="ts">
	/** BrushIcon, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
	import type { SVGAttributes } from 'svelte/elements';

	let {
		fill = 'currentColor',
		secondaryfill,
		width = '1em',
		height = '1em',
		...rest
	}: {
		fill?: string;
		secondaryfill?: string;
		width?: string | number;
		height?: string | number;
	} & SVGAttributes<SVGSVGElement> = $props();

	/** The reference does `secondaryfill = secondaryfill || fill`. */
	const secondary = $derived(secondaryfill || fill);
</script>

<svg {height} {width} viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" {...rest}>
	<g {fill}>
		<rect height="10" width="3.5" fill={secondary} fill-opacity="0.4" rx="1.25" x="1" y="4" />
		<rect height="10" width="3.5" fill={secondary} fill-opacity="0.4" rx="1.25" x="13.5" y="4" />
		<rect height="10" width="6" fill="none" rx="1.5" stroke={fill} stroke-width="2" x="6" y="4" />
	</g>
</svg>
