import { env } from '$env/dynamic/public';

export { cn } from '$lib/utils.js';

export const SITE_URL = (env.PUBLIC_APP_URL ?? 'https://evilcharts.com').replace(/\/$/, '');

export function absoluteUrl(path: string) {
	if (!path) return SITE_URL;
	return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
