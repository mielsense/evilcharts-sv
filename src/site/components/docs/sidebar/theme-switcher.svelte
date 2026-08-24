<script lang="ts">
	/**
	 * Ported from `evilcharts/src/components/docs/sidebar/theme-switcher.tsx`.
	 *
	 * `next-themes` becomes `mode-watcher`, which is what this repository already uses; the two
	 * glyphs are still swapped by the `[html.light_&]` / `[html.dark_&]` selectors rather than by
	 * reading the resolved theme, so nothing flashes on hydration.
	 */
	import { mode, toggleMode } from 'mode-watcher';
	import { MoonIcon, SunIcon } from '$site/assets/icons/index.js';
	import { Button } from '$site/components/ui/button/index.js';

	// Read so the button re-renders with the mode; the icon swap itself is CSS.
	const current = $derived(mode.current);
</script>

<Button variant="ghost" size="icon" onclick={() => toggleMode()} data-mode={current}>
	<MoonIcon class="hidden size-3.5 [html.light_&]:block" />
	<SunIcon class="hidden size-3.5 [html.dark_&]:block" />
	<span class="sr-only">Toggle theme</span>
</Button>
<span class="text-muted">|</span>
