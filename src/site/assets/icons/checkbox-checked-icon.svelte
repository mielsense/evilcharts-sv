<script lang="ts">
	/** CheckboxCheckedIcon, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
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

<svg {height} {width} viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" {...rest}>
	<g {fill}>
		<rect
			height="9.5"
			width="9.5"
			fill="none"
			rx="2"
			ry="2"
			stroke={fill}
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1"
			x="1.25"
			y="1.25"
		/>
		<polyline
			fill="none"
			points="3.747 6.5 5.25 8 8.253 4"
			stroke={secondary}
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1"
		/>
	</g>
</svg>
