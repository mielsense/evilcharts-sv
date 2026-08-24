import { error, json } from '@sveltejs/kit';
import { getRegistryItemSourceMeta } from '$site/lib/registry.js';
import { registry } from '$lib/registry/index.js';
import type { EntryGenerator, RequestHandler } from './$types.js';

/**
 * A registry item's source-file metadata.
 *
 * The reference's `<ComponentSource>` is an async server component that reads the file and
 * highlights it inline. A Svelte component cannot await, so the work moves to the selected-file
 * endpoint. This metadata response stays small, and both routes prerender to static files.
 */
export const prerender = true;

export const entries: EntryGenerator = () => registry.items.map((item) => ({ name: item.name }));

export const GET: RequestHandler = ({ params }) => {
	const item = getRegistryItemSourceMeta(params.name);
	if (!item) error(404, `Unknown registry item: ${params.name}`);

	const files = item.files.map((file, index) => ({
		path: file.path,
		target: file.target,
		language: file.path.split('.').pop() ?? 'svelte',
		url: `/api/source-file/${encodeURIComponent(item.name)}/${index}`
	}));

	return json({ name: item.name, files });
};
