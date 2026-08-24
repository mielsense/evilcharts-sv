import type { Component } from 'svelte';
import { Index } from './__index__.js';

type Loader = () => Promise<{ default: Component<Record<string, never>> }>;

/**
 * Lazy component lookup for docs previews, keyed by registry item name
 * (`ex-area-chart`, `monospace-bar-chart`, …).
 *
 * The reference generates `src/registry/__index__.tsx` — a ~5 000-line file of
 * `React.lazy(() => import(...))` entries — because Next cannot discover modules by glob.
 * Vite can, so the same lookup is derived at build time from the file tree and stays in
 * sync automatically. The generated manifest (`__index__.ts`) still carries the item
 * metadata and file lists the registry and the source viewer need.
 */
const modules = {
	...import.meta.glob<{ default: Component<Record<string, never>> }>(
		'./examples/layerchart/*.svelte'
	),
	...import.meta.glob<{ default: Component<Record<string, never>> }>('./blocks/layerchart/*.svelte')
} as Record<string, Loader>;

/** Keyed by file name, which is how an example's registry item is named. */
const byFileName: Record<string, Loader> = Object.fromEntries(
	Object.entries(modules).map(([path, loader]) => [
		path.slice(path.lastIndexOf('/') + 1, -'.svelte'.length),
		loader
	])
);

/**
 * A block's item name drops the `b-` prefix its file keeps (`monospace-bar-chart` on disk is
 * `b-monospace-bar-chart.svelte`), and the docs reference items by name. The manifest's first file
 * per item is the entry point, so it resolves the alias without a second naming convention.
 */
const byItemName: Record<string, Loader> = Object.fromEntries(
	Object.values(Index)
		.map((item) => {
			const first = item.files[0]?.path ?? '';
			const file = first.slice(first.lastIndexOf('/') + 1, -'.svelte'.length);
			const loader = byFileName[file];
			return loader ? ([item.name, loader] as const) : undefined;
		})
		.filter((entry): entry is readonly [string, Loader] => entry !== undefined)
);

export const registryComponents: Record<string, Loader> = { ...byFileName, ...byItemName };

export function getRegistryComponent(name: string): Loader | undefined {
	return registryComponents[name];
}
