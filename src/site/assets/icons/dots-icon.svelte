<script lang="ts">
	/** DotsIcon, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
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

<svg {height} {width} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...rest}>
	<g {fill}>
		<circle cx="22" cy="22" r="7" {fill} />
		<circle cx="9" cy="9" r="4" fill={secondary} fill-opacity="0.4" />
		<circle cx="5.5" cy="21.5" r="3.5" fill={secondary} fill-opacity="0.4" />
	</g>
</svg>
