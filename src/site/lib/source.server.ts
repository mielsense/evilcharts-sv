/** Server-only documentation corpus, metadata, page tree, and page lookup. */
import GithubSlugger from 'github-slugger';
import { headingId } from './mdsvex-elements.js';
import {
	flattenTree as flattenPageTree,
	type DocsPage,
	type PageData,
	type PageTree,
	type PageTreeItem,
	type TocEntry
} from './source.js';

export type {
	DocsPage,
	PageData,
	PageTree,
	PageTreeFolder,
	PageTreePage,
	TocEntry
} from './source.js';

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

const metaFiles = import.meta.glob('/content/docs/**/meta.json', { eager: true }) as Record<
	string,
	{ default: MetaFile }
>;

/** Frontmatter parser for the scalar keys and nested links object used by the docs corpus. */
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

/** Build heading metadata with the same ids as the compiled mdsvex elements. */
export function buildToc(body: string): TocEntry[] {
	const slugger = new GithubSlugger();
	const withoutCode = body.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '');
	const entries: TocEntry[] = [];

	for (const [, hashes, title] of withoutCode.matchAll(/^(#{1,6})\s+(.+?)\s*$/gm)) {
		const depth = hashes.length;
		const text = title.replace(/`/g, '').replace(/\*\*?/g, '').trim();
		entries.push({ title: text, url: `#${headingId(depth, text, slugger)}`, depth });
	}

	return entries;
}

function slugsFor(path: string): string[] {
	const relative = path.replace('/content/docs/', '').replace(/\.md$/, '');
	const segments = relative.split('/');
	const last = segments[segments.length - 1];

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
			toc: buildToc(body)
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

function buildTree(dir: string, urlPrefix: string): PageTreeItem[] {
	const meta = metaFor(dir);
	const order = meta?.pages ?? [];
	const items: PageTreeItem[] = [];

	for (const name of order) {
		const asPage =
			name === 'index' || name === 'static'
				? byUrl.get(urlPrefix)
				: byUrl.get(`${urlPrefix}/${name}`);
		const childDir = `${dir}/${name}`;
		const childMeta = metaFor(childDir);

		if (childMeta) {
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

export function flattenTree(items: PageTreeItem[] = pageTree.children): { url: string }[] {
	return flattenPageTree(items);
}

export function findNeighbour(url: string): { previous?: DocsPage; next?: DocsPage } {
	const flattened = flattenTree();
	const order = url.endsWith('/blocks')
		? flattened
		: flattened.filter((entry) => !entry.url.endsWith('/blocks'));
	const at = order.findIndex((entry) => entry.url === url);
	if (at === -1) return {};
	return {
		previous: at > 0 ? byUrl.get(order[at - 1].url) : undefined,
		next: at < order.length - 1 ? byUrl.get(order[at + 1].url) : undefined
	};
}
