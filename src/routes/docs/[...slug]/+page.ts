import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';
import type { PageLoad } from './$types.js';

const pageModules = import.meta.glob('/content/docs/**/*.md') as Record<
	string,
	() => Promise<{ default: Component<Record<string, never>> }>
>;

/** Load only the compiled Markdown component selected by the server metadata response. */
export const load: PageLoad = async ({ data }) => {
	const loadPage = pageModules[`/${data.file}`];
	if (!loadPage) error(404, 'Not found');
	const module = await loadPage();

	return {
		...data,
		content: module.default
	};
};
