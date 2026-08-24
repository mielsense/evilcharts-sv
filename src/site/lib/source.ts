/**
 * The docs page tree and page lookup.
 *
 * Replaces Fumadocs' `loader()` (`evilcharts/src/lib/source.ts`) and the collection defined in
 * `evilcharts/source.config.ts`. The API it exposes is the slice of Fumadocs' `source` that the
 * reference's docs route and agent surfaces actually use — `getPage`, `getPages`, `pageTree` and
 * `findNeighbour` — so both consume the same shape.
 *
 * Pages are discovered by glob at build time:
 *
 * - the raw markdown is inlined (`?raw`) so the frontmatter, the table of contents and the agent
 *   surfaces all read one source of truth without importing the compiled components;
 * - the compiled components are imported lazily, so a docs page ships only its own charts.
 */
import type { Component } from 'svelte';
import GithubSlugger from 'github-slugger';
import { headingId } from './mdsvex-elements.js';

export type PageLinks = {
	api?: string;
	doc?: string;
	github?: string;
};

export type PageData = {
	title: string;
	description?: string;
	image?: string;
	links?: PageLinks;
};

export type TocEntry = {
	title: string;
	url: string;
	depth: number;
};

export type DocsPage = {
	/** Path segments below `/docs`, e.g. `['layerchart', 'area-chart']`. */
	slugs: string[];
	/** The page's URL, e.g. `/docs/layerchart/area-chart`. */
	url: string;
	/** Repository-relative source path, e.g. `content/docs/layerchart/area-chart/static.md`. */
	file: string;
	data: PageData;
	/** The markdown body, frontmatter stripped. */
	body: string;
	toc: TocEntry[];
	load: () => Promise<{ default: Component<Record<string, never>> }>;
};

export type PageTreePage = { type: 'page'; name: string; url: string; description?: string };

export type PageTreeFolder = {
	type: 'folder';
	name: string;
	children: PageTreeItem[];
	/** The folder's own landing page, which is its `static.md`. */
	index?: PageTreePage;
};

export type PageTreeItem = PageTreePage | PageTreeFolder;

export type PageTree = {
	name: string;
	children: PageTreeItem[];
};

type MetaFile = {
	title?: string;
	root?: boolean;
	pages?: string[];
};

const rawPages = import.meta.glob('/content/docs/**/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const pageModules = import.meta.glob('/content/docs/**/*.md') as Record<
	string,
	() => Promise<{ default: Component<Record<string, never>> }>
>;

const metaFiles = import.meta.glob('/content/docs/**/meta.json', { eager: true }) as Record<
	string,
	{ default: MetaFile }
>;

/**
 * Frontmatter, for the handful of keys the docs declare.
 *
 * Deliberately not a YAML parser: every page in the reference uses plain scalars plus one nested
 * `links` block, and the same is true of the port. A real parser would be a dependency and a
 * larger surface for no gain.
 */
export function parseFrontmatter(source: string): { data: PageData; body: string } {
	const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
	if (!match) return { data: { title: '' }, body: source };

	const data: PageData = { title: '' };
	let nested: 'links' | null = null;

	for (const line of match[1].split(/\r?\n/)) {
		if (!line.trim()) continue;

		const indented = /^\s/.test(line);
		const [, key, value] = /^\s*([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line) ?? [];
		if (!key) continue;

		if (!indented) {
			nested = value === '' && key === 'links' ? 'links' : null;
			if (nested) {
				data.links = {};
				continue;
			}
		}

		const unquoted = value.replace(/^['"]|['"]$/g, '');

		if (nested === 'links' && indented) {
			(data.links as Record<string, string>)[key] = unquoted;
			continue;
		}

		if (key === 'title' || key === 'description' || key === 'image') data[key] = unquoted;
	}

	return { data, body: source.slice(match[0].length) };
}

/**
 * The page's headings, with the ids `mdsvex-elements.ts` gives them.
 *
 * Fumadocs derives this from the mdast. Reading it back off the markdown keeps the two in step
 * without compiling the page, which is what lets the sidebar and the agent surfaces share it.
 * Fences are stripped first so a `#` inside a code sample is not mistaken for a heading, and
 * `<ApiHeading>` is deliberately not a heading — the reference keeps those out of the ToC too.
 */
export function buildToc(body: string): TocEntry[] {
	const slugger = new GithubSlugger();
	const withoutCode = body.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '');
	const entries: TocEntry[] = [];

	for (const [, hashes, title] of withoutCode.matchAll(/^(#{1,6})\s+(.+?)\s*$/gm)) {
		const depth = hashes.length;
		// Inline code and emphasis are rendered, so strip their markers from the label.
		const text = title.replace(/`/g, '').replace(/\*\*?/g, '').trim();
		entries.push({ title: text, url: `#${headingId(depth, text, slugger)}`, depth });
	}

	return entries;
}

/** `content/docs/layerchart/area-chart/static.md` → `['layerchart', 'area-chart']`. */
function slugsFor(path: string): string[] {
	const relative = path.replace('/content/docs/', '').replace(/\.md$/, '');
	const segments = relative.split('/');
	const last = segments[segments.length - 1];

	// A chart folder's landing page is its `static.md`, and `index.md` is the docs root, exactly as
	// the reference's `meta.json` ordering implies.
	if (last === 'index' || last === 'static') segments.pop();
	return segments;
}

const pages: DocsPage[] = Object.entries(rawPages)
	.map(([path, raw]) => {
		const { data, body } = parseFrontmatter(raw);
		const slugs = slugsFor(path);
		return {
			slugs,
			url: `/docs${slugs.length ? `/${slugs.join('/')}` : ''}`,
			file: path.replace(/^\//, ''),
			data,
			body,
			toc: buildToc(body),
			load: pageModules[path]
		};
	})
	.sort((a, b) => a.url.localeCompare(b.url));

const byUrl = new Map(pages.map((page) => [page.url, page]));

export function getPages(): DocsPage[] {
	return pages;
}

export function getPage(slugs: string[] = []): DocsPage | undefined {
	return byUrl.get(`/docs${slugs.length ? `/${slugs.join('/')}` : ''}`);
}

function metaFor(dir: string): MetaFile | undefined {
	return metaFiles[`${dir}/meta.json`]?.default;
}

/**
 * The navigation tree, ordered by each directory's `meta.json` `pages` array — the same contract
 * Fumadocs uses. A name listed there may be a page (`installation`), a subdirectory
 * (`area-chart`), or a nested page path (`ui/tooltip`).
 */
function buildTree(dir: string, urlPrefix: string): PageTreeItem[] {
	const meta = metaFor(dir);
	const order = meta?.pages ?? [];
	const items: PageTreeItem[] = [];

	for (const name of order) {
		// `index` and `static` are a folder's own landing page, so they resolve to the folder's URL —
		// the same rule `slugsFor` applies when the page list is built.
		const asPage =
			name === 'index' || name === 'static'
				? byUrl.get(urlPrefix)
				: byUrl.get(`${urlPrefix}/${name}`);
		const childDir = `${dir}/${name}`;
		const childMeta = metaFor(childDir);

		if (childMeta) {
			// A directory with its own meta.json is a folder; its landing page is its `static.md`.
			const index = byUrl.get(`${urlPrefix}/${name}`);
			items.push({
				type: 'folder',
				name: childMeta.title ?? name,
				children: buildTree(childDir, `${urlPrefix}/${name}`),
				...(index
					? {
							index: {
								type: 'page' as const,
								name: index.data.title,
								url: index.url,
								description: index.data.description
							}
						}
					: {})
			});
			continue;
		}

		if (asPage) {
			items.push({
				type: 'page',
				name: asPage.data.title,
				url: asPage.url,
				description: asPage.data.description
			});
		}
	}

	return items;
}

export const pageTree: PageTree = {
	name: 'Docs',
	children: buildTree('/content/docs', '/docs')
};

/** Every page in tree order, which is what prev/next walks. */
export function flattenTree(items: PageTreeItem[] = pageTree.children): { url: string }[] {
	const seen = new Set<string>();
	const flattened: { url: string }[] = [];

	const append = (entries: PageTreeItem[]) => {
		for (const item of entries) {
			if (item.type === 'folder') {
				if (item.index && !seen.has(item.index.url)) {
					seen.add(item.index.url);
					flattened.push({ url: item.index.url });
				}
				append(item.children);
				continue;
			}

			if (!seen.has(item.url)) {
				seen.add(item.url);
				flattened.push({ url: item.url });
			}
		}
	};

	append(items);
	return flattened;
}

/** Fumadocs' `findNeighbour(tree, url)`. */
export function findNeighbour(url: string): { previous?: DocsPage; next?: DocsPage } {
	const pages = flattenTree();
	// Keep chart landing pages in the established chart-to-chart sequence. Blocks remain visible in
	// the sidebar and use the full page order when they are open, but they should not intercept the
	// previous/next controls on a chart's primary documentation page.
	const order = url.endsWith('/blocks')
		? pages
		: pages.filter((entry) => !entry.url.endsWith('/blocks'));
	const at = order.findIndex((entry) => entry.url === url);
	if (at === -1) return {};
	return {
		previous: at > 0 ? byUrl.get(order[at - 1].url) : undefined,
		next: at < order.length - 1 ? byUrl.get(order[at + 1].url) : undefined
	};
}
