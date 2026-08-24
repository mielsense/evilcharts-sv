<script lang="ts">
	/** Soft outer-glow filter applied to a glowing bar. */
	let { id, dataKey }: { id: string; dataKey: string } = $props();
</script>

<filter id={`${id}-bar-glow-${dataKey}`} x="-100%" y="-100%" width="300%" height="300%">
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
