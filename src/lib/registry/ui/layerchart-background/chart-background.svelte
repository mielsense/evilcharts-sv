<script lang="ts">
	// ── Main Component ───────────────────────────────────────────────────────────
	// Usage: Place <ChartBackground variant="dots" /> inside any Evil chart component.
	//
	// The reference wraps this in Recharts' `<ZIndexLayer zIndex={-1}>`. LayerChart has no
	// z-index layer, so each chart root renders the registered background slot as the *first*
	// child inside its <Svg>, which paints it behind every other mark. See
	// plans/DEVIATIONS.md U-5.
	import { PATTERN_MAP } from './pattern-map.js';
	import type { BackgroundVariant } from './types.js';

	let { variant }: { variant: BackgroundVariant } = $props();

	const baseId = $props.id();
	const patternId = $derived(`${baseId}-bg-${variant}`);
	const maskId = $derived(`${baseId}-bg-edge-fade`);
	const filterId = $derived(`${baseId}-bg-blur`);
	const PatternComponent = $derived(PATTERN_MAP[variant]);
</script>

<defs>
	<PatternComponent id={patternId} />
	<!-- Gaussian blur filter for soft edge fade -->
	<filter id={filterId}>
		<feGaussianBlur stdDeviation="25" />
	</filter>
	<!-- Mask: a slightly inset white rect with blur creates smooth transparent edges -->
	<mask id={maskId} maskUnits="userSpaceOnUse">
		<rect x="8%" y="20%" width="85%" height="60%" fill="white" filter={`url(#${filterId})`} />
	</mask>
</defs>
<rect width="100%" height="100%" fill={`url(#${patternId})`} mask={`url(#${maskId})`} />
