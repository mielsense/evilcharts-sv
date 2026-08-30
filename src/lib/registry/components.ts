import type { Component } from 'svelte';

type Loader = () => Promise<{ default: Component<Record<string, never>> }>;

/**
 * Lazy component lookup for docs previews, keyed by registry item name
 * (`ex-area-chart`, `monospace-bar-chart`, …).
 *
 * The reference generates `src/registry/__index__.tsx` — a ~5 000-line file of
 * `React.lazy(() => import(...))` entries — because Next cannot discover modules by glob.
 * Vite can, so the same lookup is derived at build time from the file tree and stays in
 * sync automatically. The server-side source viewer still uses the generated manifest metadata.
 */
const modules = {
	...import.meta.glob<{ default: Component<Record<string, never>> }>(
		'./examples/layerchart/*.svelte'
	),
	...import.meta.glob<{ default: Component<Record<string, never>> }>(
		'./blocks/layerchart/*.svelte'
	),
	...import.meta.glob<{ default: Component<Record<string, never>> }>('./examples/echarts/*.svelte'),
	...import.meta.glob<{ default: Component<Record<string, never>> }>('./blocks/echarts/*.svelte')
} as Record<string, Loader>;

/**
 * Examples use their file name as the registry name. Blocks follow the stable registry convention
 * where `b-example.svelte` is installed as `example`, so expose both the source file name and that
 * public alias without importing the full generated registry index into the browser graph.
 */
export const registryComponents: Record<string, Loader> = Object.fromEntries(
	Object.entries(modules).flatMap(([path, loader]) => {
		const fileName = path.slice(path.lastIndexOf('/') + 1, -'.svelte'.length);
		const entries: Array<readonly [string, Loader]> = [[fileName, loader]];
		if (path.includes('/blocks/') && fileName.startsWith('b-')) {
			entries.push([fileName.slice('b-'.length), loader]);
		}
		return entries;
	})
);

export function getRegistryComponent(name: string): Loader | undefined {
	return registryComponents[name];
}
