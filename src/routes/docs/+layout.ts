import { useGithubStars } from '$site/hooks/use-github-stars.js';
import type { LayoutLoad } from './$types.js';

/**
 * Prerendered, as the reference's docs layout is (`dynamic = 'force-static'`). The star count is
 * fetched once at build time; the reference revalidates daily, which for a static build means the
 * same thing — a rebuild.
 */
export const prerender = true;

export const load: LayoutLoad = async ({ fetch }) => ({
	stars: await useGithubStars(fetch)
});
