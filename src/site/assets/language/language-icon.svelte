<script lang="ts">
	/**
	 * `getIconForLanguageExtension` from `evilcharts/src/assets/language/icons.tsx`.
	 *
	 * The reference draws these from `@hugeicons/core-free-icons`. That package is not a dependency
	 * here, so the nearest Lucide glyph stands in for each — same size, same position, same switch.
	 */
	import Braces from '@lucide/svelte/icons/braces';
	import FileCode from '@lucide/svelte/icons/file-code';
	import FileType from '@lucide/svelte/icons/file-type';
	import Folder from '@lucide/svelte/icons/folder';
	import Terminal from '@lucide/svelte/icons/terminal';
	import Box from '@lucide/svelte/icons/box';

	let { language, class: className }: { language: string; class?: string } = $props();

	const Icon = $derived.by(() => {
		switch (language) {
			case 'json':
				return Braces;
			case 'css':
				return FileType;
			case 'js':
			case 'jsx':
			case 'ts':
			case 'tsx':
			case 'typescript':
			case 'svelte':
				return FileCode;
			case 'bash':
				return Terminal;
			case 'component':
				return Box;
			default:
				return Folder;
		}
	});
</script>

<Icon class={className} />
