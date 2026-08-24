<script lang="ts">
	/** InfoIcon, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
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
			d="M9 16.25C13.0041 16.25 16.25 13.004 16.25 9C16.25 4.996 13.0041 1.75 9 1.75C4.9959 1.75 1.75 4.996 1.75 9C1.75 13.004 4.9959 16.25 9 16.25Z"
			fill="none"
			stroke={fill}
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
		/>
		<path
			d="M9 5.431V9.5"
			fill="none"
			stroke={secondary}
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
		/>
		<path
			d="M9 13.417C8.448 13.417 8 12.968 8 12.417C8 11.866 8.448 11.417 9 11.417C9.552 11.417 10 11.866 10 12.417C10 12.968 9.552 13.417 9 13.417Z"
			fill={secondary}
			stroke="none"
		/>
	</g>
</svg>
