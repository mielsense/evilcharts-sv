import { useGithubStars } from '$site/hooks/use-github-stars.server.js';
import type { PageServerLoad } from './$types.js';

/**
 * Prerendered. The reference serves this from cache with ISR (`revalidate = 3600`); for a static
 * build the equivalent is a fresh star count on every deploy.
 */
export const prerender = true;

export const load: PageServerLoad = async ({ fetch }) => ({
	stars: await useGithubStars(fetch)
});
