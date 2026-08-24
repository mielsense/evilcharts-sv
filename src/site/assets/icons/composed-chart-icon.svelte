<script lang="ts">
	/** ComposedChartIcon, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
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
		<!-- Bar chart bars - narrower -->
		<rect x="2.5" y="9" width="4" height="6.5" rx="1.5" fill={secondary} opacity="0.4" />
		<rect x="7.5" y="4" width="4" height="11.5" rx="1.5" fill={secondary} opacity="0.4" />
		<rect x="12.5" y="6" width="4" height="9.5" rx="1.5" fill={secondary} opacity="0.4" />
		<!-- Line chart line overlay -->
		<path
			d="M2 10.5 L5 13.5L9 8.5L13 10.5L17 7.5"
			fill="none"
			stroke={fill}
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</g>
</svg>
