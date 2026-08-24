<script lang="ts">
	/** ChartLegendIcon, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
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
		<rect height="4.5" width="4.5" {fill} rx="1.5" ry="1.5" stroke-width="0" x="6.75" y="2" />
		<path
			d="m15.5,2h-1.5c-.8271,0-1.5.6729-1.5,1.5v1.5c0,.8271.6729,1.5,1.5,1.5h1.5c.8271,0,1.5-.6729,1.5-1.5v-1.5c0-.8271-.6729-1.5-1.5-1.5Z"
			fill={secondary}
			opacity=".4"
			stroke-width="0"
		/>
		<path
			d="m5.5,5v-1.5c0-.8271-.6729-1.5-1.5-1.5h-1.5c-.8271,0-1.5.6729-1.5,1.5v1.5c0,.8271.6729,1.5,1.5,1.5h1.5c.8271,0,1.5-.6729,1.5-1.5Z"
			fill={secondary}
			opacity=".4"
			stroke-width="0"
		/>
		<path
			d="m10.5586,8.0659l-6.854,2.5039c-.4307.1577-.7134.5713-.7041,1.0298s.3091.8604.7456,1l2.7686.8857.8857,2.7686c.1396.4365.5415.7363,1,.7456.0073.0005.0146.0005.022.0005.4497,0,.853-.2808,1.0078-.7046l2.5039-6.854c.1445-.3965.0493-.8281-.249-1.1265-.2983-.2988-.731-.3926-1.1265-.249Z"
			{fill}
			stroke-width="0"
		/>
	</g>
</svg>
