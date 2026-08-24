import { PORT_REPO_API_URL, PORT_STARS_FALLBACK } from '$site/globals/constants/site.js';

const CACHE_TTL_MS = 60 * 60_000;
const RETRY_TTL_MS = 60_000;

let cached: { value: number; expiresAt: number } | undefined;
let refreshPromise: Promise<number> | undefined;

function remember(value: number, ttl: number): number {
	cached = { value, expiresAt: Date.now() + ttl };
	return value;
}

async function refreshStars(fetcher: typeof fetch): Promise<number> {
	try {
		const res = await fetcher(PORT_REPO_API_URL, {
			headers: {
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28'
			}
		});

		if (!res.ok) return remember(cached?.value ?? PORT_STARS_FALLBACK, RETRY_TTL_MS);

		const data = await res.json();
		if (typeof data.stargazers_count !== 'number') {
			return remember(cached?.value ?? PORT_STARS_FALLBACK, RETRY_TTL_MS);
		}

		return remember(data.stargazers_count, CACHE_TTL_MS);
	} catch {
		return remember(cached?.value ?? PORT_STARS_FALLBACK, RETRY_TTL_MS);
	}
}

export function useGithubStars(fetcher: typeof fetch = fetch): Promise<number> {
	if (cached && Date.now() < cached.expiresAt) return Promise.resolve(cached.value);
	if (refreshPromise) return refreshPromise;

	const pending = refreshStars(fetcher);
	refreshPromise = pending;
	void pending.finally(() => {
		if (refreshPromise === pending) refreshPromise = undefined;
	});
	return pending;
}
