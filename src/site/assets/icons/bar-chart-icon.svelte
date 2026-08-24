<script lang="ts">
	/** BarChartIcon, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
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
			d="m6.75,9h-3.5c-.9648,0-1.75.7852-1.75,1.75v3c0,.9648.7852,1.75,1.75,1.75h3.5c.4141,0,.75-.3359.75-.75v-5c0-.4141-.3359-.75-.75-.75Z"
			fill={secondary}
			opacity=".4"
			stroke-width="0"
		/>
		<path
			d="m14.75,5.5h-3.5c-.4141,0-.75.3359-.75.75v8.5c0,.4141.3359.75.75.75h3.5c.9648,0,1.75-.7852,1.75-1.75v-6.5c0-.9648-.7852-1.75-1.75-1.75Z"
			fill={secondary}
			opacity=".4"
			stroke-width="0"
		/>
		<path
			d="m10.25,2h-2.5c-.9648,0-1.75.7852-1.75,1.75v11c0,.4141.3359.75.75.75h4.5c.4141,0,.75-.3359.75-.75V3.75c0-.9648-.7852-1.75-1.75-1.75Z"
			{fill}
			stroke-width="0"
		/>
	</g>
</svg>
