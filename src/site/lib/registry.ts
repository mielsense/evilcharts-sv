/**
 * Reads a registry item's sources for the docs.
 *
 * Ported from `evilcharts/src/lib/registry.ts`. Runs on the server only — the generated
 * `__index__.ts` carries the metadata, and the file bodies are read off disk at request time.
 *
 * Two no-op reference implementation details are intentionally omitted:
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

export type RegistryItemSourceMeta = RegistryItemFile & {
	/** Display path, relative to the item's own directory. */
	path: string;
};

export function getRegistryItemMeta(name: string): RegistryItem | undefined {
	return Index[name];
}

export function getRegistryItemSourceMeta(
	name: string
): (Omit<RegistryItem, 'files'> & { files: RegistryItemSourceMeta[] }) | null {
	const item = Index[name];
	if (!item) return null;

	return { ...item, files: relativise(orderSourceFiles(item.files)) };
}

export async function getRegistryItemSourceFile(
	name: string,
	index: number
): Promise<RegistryItemSource | null> {
	const item = Index[name];
	const files = item ? orderSourceFiles(item.files) : [];
	const file = files[index];
	if (!item || !file) return null;

	const [relative] = relativise([file], path.dirname(files[0]?.path ?? file.path));
	return {
		...relative,
		content: fixImports(
			await readFile(path.join(process.cwd(), 'src/lib/registry', file.path), 'utf8')
		)
	};
}

export async function getRegistryItem(name: string): Promise<RegistryItemWithSources | null> {
	const item = Index[name];
	if (!item) return null;

	// The reads are independent, so they go out together.
	const files = await Promise.all(
		orderSourceFiles(item.files).map(async (file) => ({
			...file,
			content: fixImports(
				await readFile(path.join(process.cwd(), 'src/lib/registry', file.path), 'utf8')
			)
		}))
	);

	return { ...item, files: relativise(files) };
}

/** Keep component source ahead of support types so adding a helper cannot change the default tab. */
function orderSourceFiles<T extends RegistryItemFile>(files: T[]): T[] {
	return files
		.map((file, index) => ({ file, index }))
		.sort((left, right) => {
			const leftIsComponent = left.file.path.endsWith('.svelte');
			const rightIsComponent = right.file.path.endsWith('.svelte');
			if (leftIsComponent !== rightIsComponent) return leftIsComponent ? -1 : 1;
			return left.index - right.index;
		})
		.map(({ file }) => file);
}

/**
 * Rewrites registry imports to the paths a consumer will have.
 *
 * The generated registry flattens provider block folders into the consumer's `blocks/` directory.
 * Keep this source-view transform identical to `scripts/build-registry.ts`, including relative
 * cross-item imports, so copyable code matches what the CLI installs.
 */
export function fixImports(content: string): string {
	return content
		.replaceAll('$lib/registry/', `${CONSUMER_ROOT}/`)
		.replace(/(['"])\.\.\/\.\.\/charts\//g, `$1${CONSUMER_ROOT}/charts/`)
		.replace(/(['"])\.\.\/\.\.\/ui\//g, `$1${CONSUMER_ROOT}/ui/`)
		.replace(/(from\s+['"]\.\/)b-/g, '$1');
}

/** Paths shown relative to the item's own directory, as the reference's `fixFilePaths` does. */
function relativise<T extends RegistryItemFile>(
	files: T[],
	root = files[0] ? path.dirname(files[0].path) : ''
): (T & { path: string })[] {
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
