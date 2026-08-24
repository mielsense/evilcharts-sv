<script lang="ts">
	/**
	 * An optional decorative pattern drawn behind the pie. Compose it before the <Pie /> so it
	 * sits underneath the sectors.
	 */
	import { ChartBackground, type BackgroundVariant } from '../../ui/layerchart-background/index.js';

	let { variant = 'dots' }: { variant?: BackgroundVariant } = $props();
</script>

<ChartBackground {variant} />
