import { env } from '$env/dynamic/public';

export { cn } from '$lib/utils.js';

/**
 * This deployment's own origin, used for canonical tags, OG images, the sitemap and every absolute
 * URL the agent surfaces publish.
 *
 * Set `PUBLIC_APP_URL` in the environment. The fallback is deliberately *not* the original
 * project's domain — a port claiming `evilcharts.com` as its canonical origin would compete with it
 * in search and hand agents install URLs that do not serve this registry.
 */
export const SITE_URL = (
	env.PUBLIC_APP_URL ??
	// Vercel injects this on every deployment, including previews.
	(env.PUBLIC_VERCEL_URL ? `https://${env.PUBLIC_VERCEL_URL}` : undefined) ??
	'http://localhost:5173'
).replace(/\/$/, '');

export function absoluteUrl(path: string) {
	if (!path) return SITE_URL;
	return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
