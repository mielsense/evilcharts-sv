<script lang="ts">
	/** Primary-coloured stroke gradient highlighting a link connected to the selection. */
	let { chartId, index }: { chartId: string; index: number } = $props();
</script>

<linearGradient id={`${chartId}-link-stroke-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
	<stop offset="0%" stop-color="var(--primary)" stop-opacity={0} />
	<stop offset="15%" stop-color="var(--primary)" stop-opacity={0.8} />
	<stop offset="50%" stop-color="var(--primary)" stop-opacity={1} />
	<stop offset="85%" stop-color="var(--primary)" stop-opacity={0.8} />
	<stop offset="100%" stop-color="var(--primary)" stop-opacity={0} />
</linearGradient>
