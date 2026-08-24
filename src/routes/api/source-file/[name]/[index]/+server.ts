import { error, json } from '@sveltejs/kit';
import { highlightCode, stripCodeAnnotations } from '$site/lib/highlight-code.js';
import { getRegistryItemSourceFile } from '$site/lib/registry.js';
import { registry } from '$lib/registry/index.js';
import type { EntryGenerator, RequestHandler } from './$types.js';

export const prerender = true;

export const entries: EntryGenerator = () =>
	registry.items.flatMap((item) =>
		item.files.map((_, index) => ({ name: item.name, index: String(index) }))
	);

export const GET: RequestHandler = async ({ params }) => {
	if (!/^\d+$/.test(params.index)) error(404, `Unknown source file index: ${params.index}`);

	const file = await getRegistryItemSourceFile(params.name, Number(params.index));
	if (!file) error(404, `Unknown source file: ${params.name}/${params.index}`);

	const language = file.path.split('.').pop() ?? 'svelte';
	return json({
		path: file.path,
		target: file.target,
		language,
		code: stripCodeAnnotations(file.content),
		html: await highlightCode(file.content, language)
	});
};
