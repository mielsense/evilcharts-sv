import { error, json } from '@sveltejs/kit';
import { getRegistryItem } from '$site/lib/registry.js';
import { highlightCode, stripCodeAnnotations } from '$site/lib/highlight-code.js';
import { registry } from '$lib/registry/index.js';
import type { EntryGenerator, RequestHandler } from './$types.js';

/**
 * A registry item's sources, highlighted.
 *
 * The reference's `<ComponentSource>` is an async server component that reads the file and
 * highlights it inline. A Svelte component cannot await, so the work moves here and the component
 * fetches it — which is no slower in practice, because the source only ever appears behind the
 * Code tab. Prerendered, so the built site serves it as a static file.
 * See plans/DEVIATIONS.md D-3.
 */
export const prerender = true;

export const entries: EntryGenerator = () => registry.items.map((item) => ({ name: item.name }));

export const GET: RequestHandler = async ({ params }) => {
	const item = await getRegistryItem(params.name);
	if (!item) error(404, `Unknown registry item: ${params.name}`);

	const files = await Promise.all(
		item.files.map(async (file) => {
			const language = file.path.split('.').pop() ?? 'svelte';
			return {
				path: file.path,
				target: file.target,
				language,
				code: stripCodeAnnotations(file.content),
				html: await highlightCode(file.content, language)
			};
		})
	);

	return json({ name: item.name, files });
};
