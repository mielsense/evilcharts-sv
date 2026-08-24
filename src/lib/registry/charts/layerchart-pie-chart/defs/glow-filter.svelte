<script lang="ts">
	/** Soft outer-glow SVG filter, one per glowing sector. */
	let { id, glowingSectors }: { id: string; glowingSectors: string[] } = $props();
</script>

{#each glowingSectors as sectorName (sectorName)}
	<filter id={`${id}-glow-${sectorName}`} x="-100%" y="-100%" width="300%" height="300%">
		<feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
		<feColorMatrix
			in="blur"
			type="matrix"
			values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 0.5 0"
			result="glow"
		/>
		<feMerge>
			<feMergeNode in="glow" />
			<feMergeNode in="SourceGraphic" />
		</feMerge>
	</filter>
{/each}
