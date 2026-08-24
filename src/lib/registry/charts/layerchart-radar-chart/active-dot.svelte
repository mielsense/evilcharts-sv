<script lang="ts">
	/**
	 * Declares the hovered/active point marker for the <Radar /> it is composed
	 * inside. Like <Dot />, it is a configuration slot and renders nothing itself.
	 */
	import { useRadarSlots } from './radar-slots.svelte.js';
	import type { DotVariant } from '../../ui/layerchart-dot/types.js';

	let { variant }: { variant?: DotVariant } = $props();

	const slots = useRadarSlots();
	const token = $props.id();

	$effect.pre(() => {
		slots.registerActiveDot(token, variant);
		return () => slots.unregisterActiveDot(token);
	});
</script>
