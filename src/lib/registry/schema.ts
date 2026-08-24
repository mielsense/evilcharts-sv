/**
 * The shadcn registry schema, as much of it as this registry uses.
 *
 * The reference imports these types from the `shadcn` package (`import type { Registry } from
 * 'shadcn/schema'`). That package is the React CLI and is not a dependency here, so the shapes are
 * declared locally against shadcn-**svelte**'s published schema at
 * https://shadcn-svelte.com/schema/registry-item.json — the CLI that installs this registry.
 * See plans/DEVIATIONS.md R-1.
 */

export type RegistryItemType =
	| 'registry:block'
	| 'registry:component'
	| 'registry:lib'
	| 'registry:hook'
	| 'registry:ui'
	| 'registry:page'
	| 'registry:file'
	| 'registry:style'
	| 'registry:theme';

export type RegistryItemFile = {
	/** Source path, relative to `src/lib/registry/`. A directory expands to every file inside it. */
	path: string;
	type: RegistryItemType;
	/** Where the file lands in a consumer's project. Required for anything outside `registry:block`. */
	target?: string;
	/** Filled in by `scripts/build-registry.ts`; never authored by hand. */
	content?: string;
};

export type RegistryItem = {
	name: string;
	type: RegistryItemType;
	title?: string;
	description?: string;
	/** npm packages the item needs. */
	dependencies?: string[];
	/** Other registry items, by `@evilcharts/<name>`. */
	registryDependencies?: string[];
	files: RegistryItemFile[];
	categories?: string[];
	meta?: Record<string, unknown>;
};

export type Registry = {
	name: string;
	homepage: string;
	items: RegistryItem[];
};

export const REGISTRY_ITEM_SCHEMA = 'https://shadcn-svelte.com/schema/registry-item.json';
export const REGISTRY_SCHEMA = 'https://shadcn-svelte.com/schema/registry.json';
