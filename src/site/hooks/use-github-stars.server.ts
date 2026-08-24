import { PORT_REPO_API_URL, PORT_STARS_FALLBACK } from '$site/globals/constants/site.js';

export const useGithubStars = async (fetcher: typeof fetch = fetch): Promise<number> => {
	try {
		const res = await fetcher(PORT_REPO_API_URL, {
			headers: {
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28'
			}
		});

		if (!res.ok) {
			return PORT_STARS_FALLBACK;
		}

		const data = await res.json();
		return typeof data.stargazers_count === 'number' ? data.stargazers_count : PORT_STARS_FALLBACK;
	} catch {
		return PORT_STARS_FALLBACK;
	}
};
