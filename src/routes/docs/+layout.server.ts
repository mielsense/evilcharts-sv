import { useGithubStars } from '$site/hooks/use-github-stars.server.js';
import type { LayoutServerLoad } from './$types.js';

/**
 * Kept dynamic so requests for canonical docs URLs can negotiate Markdown in production.
 */
export const prerender = false;

export const load: LayoutServerLoad = async ({ fetch }) => ({
	stars: await useGithubStars(fetch)
});
