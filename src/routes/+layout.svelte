<script lang="ts">
	import './fonts.css';
	import './layout.css';

	import { ModeWatcher } from 'mode-watcher';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<!-- The reference wraps its tree in `next-themes`' ThemeProvider with
     `defaultTheme="system" attribute="class"`; ModeWatcher is the equivalent. -->
<!--
	`lightClassNames` puts a `light` class on `<html>` alongside the default `dark` one, which is what
	the ported theme switcher's `[html.light_&]` / `[html.dark_&]` selectors key off — the reference
	gets both from `next-themes`' `attribute="class"`.
-->
<ModeWatcher lightClassNames={['light']} />

{@render children()}
