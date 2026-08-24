<script lang="ts">
	/** ChartStackedAreaIcon, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
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
			d="M17 3.70299C17 2.69702 15.8709 2.10066 15.0402 2.67357L8.99926 6.83961L5.76729 4.61823C5.27016 4.27631 4.60011 4.33822 4.17467 4.76366L1.36567 7.57266L1.36284 7.5755C1.13264 7.80818 1 8.12404 1 8.45699V12.25C1 13.7692 2.23079 15 3.75 15H14.25C15.7692 15 17 13.7692 17 12.25V3.70299Z"
			fill={secondary}
			fill-opacity="0.4"
		/>
		<path
			d="M17 8.96125C16.9878 8.7256 16.8652 8.50845 16.6678 8.37648C16.4596 8.23731 16.1957 8.21123 15.9643 8.30698L9.10897 11.1435L5.739 8.616L5.73733 8.61475C5.30873 8.29516 4.72063 8.28052 4.27601 8.58911L1.3231 10.6334C1.12075 10.7734 1 11.0039 1 11.25V12.25C1 13.7692 2.23079 15 3.75 15H14.25C15.7692 15 17 13.7692 17 12.25V8.96125Z"
			{fill}
		/>
	</g>
</svg>
