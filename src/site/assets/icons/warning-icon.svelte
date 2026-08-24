<script lang="ts">
	/** WarningIcon, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
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
		<path
			d="M7.63796 3.48996L2.21295 12.89C1.60795 13.9399 2.36395 15.25 3.57495 15.25H14.425C15.636 15.25 16.392 13.9399 15.787 12.89L10.362 3.48996C9.75696 2.44996 8.24296 2.44996 7.63796 3.48996Z"
			fill="none"
			stroke={fill}
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
		/>
		<path
			d="M9 6.75V9.75"
			fill="none"
			stroke={secondary}
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
		/>
		<path
			d="M9 13.5C8.448 13.5 8 13.05 8 12.5C8 11.95 8.448 11.5 9 11.5C9.552 11.5 10 11.9501 10 12.5C10 13.0499 9.552 13.5 9 13.5Z"
			fill={secondary}
			stroke="none"
		/>
	</g>
</svg>
