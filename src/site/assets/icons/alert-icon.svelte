<script lang="ts">
	/** AlertIcon, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
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
			d="M13.25 2.75H4.75C3.6454 2.75 2.75 3.65 2.75 4.75V13.25C2.75 14.35 3.6454 15.25 4.75 15.25H13.25C14.3546 15.25 15.25 14.35 15.25 13.25V4.75C15.25 3.65 14.3546 2.75 13.25 2.75Z"
			fill="none"
			stroke={fill}
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
		/>
		<path
			d="M9 5.43103V9.5"
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
