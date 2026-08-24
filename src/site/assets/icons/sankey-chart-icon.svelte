<script lang="ts">
	/** SankeyChartIcon, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
	import type { SVGAttributes } from 'svelte/elements';

	let {
		fill = 'currentColor',
		width = '1em',
		height = '1em',
		...rest
	}: {
		fill?: string;
		width?: string | number;
		height?: string | number;
	} & SVGAttributes<SVGSVGElement> = $props();
</script>

<svg {height} {width} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
	<path
		d="M17 1H1V9H4.49217C5.11298 9.00084 6.23676 8.97225 6.79234 9.24927L9.5 10.5L6.28097 12.0061C5.72532 12.2832 5.12089 12.4992 4.5 12.5H1V17H5.12749C5.92577 16.9991 6.71299 16.8133 7.42743 16.4571L12 14.5C12.5556 14.223 13.3792 14.0008 14 14L17 13.9939V8H14C13.3792 7.99916 13.0983 7.92246 12 7.5L8 5.99389H17V1ZM2 2H3V8H2V2ZM2 13.5H3V16H2V13.5ZM16 13H15V9H16V13ZM7.42743 6.36517L12 8.5C12.5419 8.76976 13.3984 8.93253 14 9V11.5H13.5C12.5 11.5 12.0556 11.277 11.5 11L6.5 8.5C5.78553 8.14368 5.50783 9 4.5 8.5L4 8V6H5C5.62089 6.00081 6.87178 6.08812 7.42743 6.36517ZM16 5H15V2H16V5Z"
		{fill}
		fill-opacity="0.4"
	/>
	<path
		d="M3.5 8.5H1.5V1.5H3.5V5.5M3.5 8.5C4.5 8.5 6.5 8.5 9 10C12.4567 12.074 12 12 14.5 12M3.5 8.5V5.5M14.5 12V13.5H16.5V8.5H14.5M14.5 12V8.5M14.5 8.5C12.5 8.5 11.1 7.8 9.5 7C7.9 6.2 6.5 5.5 3.5 5.5"
		stroke={fill}
		{fill}
		stroke-opacity="1"
		fill-opacity="1"
	/>
</svg>
