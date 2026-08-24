<script lang="ts">
	/**
	 * Declares a resting point marker for the <Radar /> it is composed inside.
	 * It renders nothing on its own — the parent <Radar /> reads its variant and
	 * wires it into the dot slot.
	 */
	import { useRadarSlots } from './radar-slots.svelte.js';
	import type { DotVariant } from '../../ui/layerchart-dot/types.js';

	let { variant }: { variant?: DotVariant } = $props();

	const slots = useRadarSlots();
	const token = $props.id();

	$effect.pre(() => {
		slots.registerDot(token, variant);
		return () => slots.unregisterDot(token);
	});
</script>
