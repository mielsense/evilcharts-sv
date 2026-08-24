<script lang="ts">
	import { THEMES, type ChartConfig, type ThemeKey } from './chart-config.js';
	import { distributeColors, getColorsCount } from './colors.js';

	let { id, config }: { id: string; config: ChartConfig } = $props();

	const colorConfig = $derived(
		Object.entries(config).filter(([, itemConfig]) => itemConfig.colors)
	);

	function generateCssVars(theme: ThemeKey) {
		return colorConfig
			.flatMap(([key, itemConfig]) => {
				const colorsArray = itemConfig.colors?.[theme];
				if (!colorsArray || !Array.isArray(colorsArray) || colorsArray.length === 0) {
					return [];
				}

				// Get max count across all themes for this key
				const maxCount = getColorsCount(itemConfig);

				// Distribute colors evenly across all required slots
				const distributedColors = distributeColors(colorsArray, maxCount);

				return distributedColors.map((color, index) => `  --color-${key}-${index}: ${color};`);
			})
			.filter(Boolean)
			.join('\n');
	}

	const css = $derived(
		Object.entries(THEMES)
			.map(
				([theme, prefix]) =>
					`${prefix} [data-chart=${id}] {\n${generateCssVars(theme as ThemeKey)}\n}`
			)
			.join('\n')
	);
</script>

{#if colorConfig.length}
	<!-- A plain <style> element in a Svelte template is scoped-compiled, so the tag is built
	     dynamically to emit global CSS — the equivalent of the reference's
	     `<style dangerouslySetInnerHTML>`. Building it as an element (rather than {@html})
	     means the CSS text can never be parsed as markup. -->
	<svelte:element this={"style"}>{css}</svelte:element>
{/if}
