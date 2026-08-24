/**
 * Reads a registry item's sources for the docs.
 *
 * Ported from `evilcharts/src/lib/registry.ts`. Runs on the server only — the generated
 * `__index__.ts` carries the metadata, and the file bodies are read off disk at request time.
 *
 * Two things the reference does are dropped, both no-ops here (plans/DEVIATIONS.md R-4):
 *
 * - `ts-morph` round-trips each file through a `SourceFile` and reads `getFullText()` straight
 *   back out. Every transform behind it is commented out in the reference, so the parse changes
 *   nothing and the dependency is not carried over.
 * - `getFileTarget`'s fallbacks for a missing `target`. Every non-example item here declares one,
 *   and examples deliberately have none.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Index } from '$lib/registry/__index__.js';
import type { RegistryItem, RegistryItemFile } from '$lib/registry/schema.js';

/** Where the consumer paths in `target` are rooted. */
const CONSUMER_ROOT = '$lib/components/evilcharts';

export type RegistryItemSource = RegistryItemFile & {
	content: string;
	/** Display path, relative to the item's own directory. */
	path: string;
};

export type RegistryItemWithSources = Omit<RegistryItem, 'files'> & {
	files: RegistryItemSource[];
};

export function getRegistryItemMeta(name: string): RegistryItem | undefined {
	return Index[name];
}

export async function getRegistryItem(name: string): Promise<RegistryItemWithSources | null> {
	const item = Index[name];
	if (!item) return null;

	// The reads are independent, so they go out together.
	const files = await Promise.all(
		item.files.map(async (file) => ({
			...file,
			content: fixImports(
				await readFile(path.join(process.cwd(), 'src/lib/registry', file.path), 'utf8')
			)
		}))
	);

	return { ...item, files: relativise(files) };
}

/**
 * Rewrites registry imports to the paths a consumer will have.
 *
 * The installed layout mirrors the source layout — `charts/`, `ui/` and `blocks/` stay siblings
 * under `$lib/components/evilcharts` — so the relative imports *between* items already resolve and
 * only the `$lib/registry/…` alias has to move. That makes this a single substitution where the
 * reference needs a five-branch regex over `@/(…)/(components|ui|hooks|lib|charts)/(…)`.
 */
export function fixImports(content: string): string {
	return content.replaceAll('$lib/registry/', `${CONSUMER_ROOT}/`);
}

/** Paths shown relative to the item's own directory, as the reference's `fixFilePaths` does. */
function relativise(files: (RegistryItemFile & { content: string })[]): RegistryItemSource[] {
	const root = files[0] ? path.dirname(files[0].path) : '';
	return files.map((file) => ({ ...file, path: path.relative(root, file.path) }));
}

export type FileTree = {
	name: string;
	path?: string;
	children?: FileTree[];
};

/**
 * The file tree the source viewer renders, keyed by each file's consumer target when it has one.
 * Ported unchanged from the reference's `createFileTreeForRegistryItemFiles`.
 */
export function createFileTree(files: { path: string; target?: string }[]): FileTree[] {
	const root: FileTree[] = [];

	for (const file of files) {
		const full = file.target ?? file.path;
		const parts = full.split('/');
		let level = root;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			if (!part) continue;
			const isFile = i === parts.length - 1;
			const existing = level.find((node) => node.name === part);

			if (existing) {
				if (isFile) existing.path = full;
				else if (existing.children) level = existing.children;
				continue;
			}

			const node: FileTree = isFile ? { name: part, path: full } : { name: part, children: [] };
			level.push(node);
			if (!isFile && node.children) level = node.children;
		}
	}

	return root;
}
