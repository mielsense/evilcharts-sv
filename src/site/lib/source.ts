/**
 * Serializable documentation shapes and tree helpers shared with hydrated docs UI.
 *
 * The eager Markdown corpus lives in `source.server.ts`. Keeping this module data-only prevents a
 * sidebar or table-of-contents type import from pulling every authored page into browser chunks.
 */

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
	slugs: string[];
	url: string;
	file: string;
	data: PageData;
	body: string;
	toc: TocEntry[];
};

export type PageTreePage = { type: 'page'; name: string; url: string; description?: string };

export type PageTreeFolder = {
	type: 'folder';
	name: string;
	children: PageTreeItem[];
	index?: PageTreePage;
};

export type PageTreeItem = PageTreePage | PageTreeFolder;

export type PageTree = {
	name: string;
	children: PageTreeItem[];
};

/** Every page in tree order. */
export function flattenTree(items: PageTreeItem[]): { url: string }[] {
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
