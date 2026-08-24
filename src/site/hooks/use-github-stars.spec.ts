import { describe, expect, it, vi } from 'vitest';
import {
	PORT_REPO_API_URL,
	PORT_REPO_URL,
	PORT_STARS_FALLBACK,
	formatGithubStarsLabel
} from '$site/globals/constants/site.js';
import { useGithubStars } from './use-github-stars.js';

function response(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

describe('useGithubStars', () => {
	it.each([
		[0, '0 GitHub stars'],
		[1, '1 GitHub star'],
		[2, '2 GitHub stars']
	])('formats %i for assistive technology', (stars, label) => {
		expect(formatGithubStarsLabel(stars)).toBe(label);
	});

	it('returns the numeric star count from the port repository', async () => {
		const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({ stargazers_count: 1 }));

		expect(await useGithubStars(fetcher)).toBe(1);
		expect(fetcher).toHaveBeenCalledWith(
			PORT_REPO_API_URL,
			expect.objectContaining({
				headers: expect.objectContaining({ Accept: 'application/vnd.github+json' })
			})
		);
		expect(PORT_REPO_URL).toBe('https://github.com/mielsense/evilcharts-sv');
	});

	it('keeps a valid zero count', async () => {
		const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({ stargazers_count: 0 }));

		expect(await useGithubStars(fetcher)).toBe(0);
	});

	it.each([
		['an HTTP failure', response({ message: 'rate limited' }, 403)],
		['a malformed payload', response({ stargazers_count: 'many' })]
	])('uses the verified fallback for %s', async (_case, result) => {
		const fetcher = vi.fn<typeof fetch>().mockResolvedValue(result);

		expect(await useGithubStars(fetcher)).toBe(PORT_STARS_FALLBACK);
	});

	it('uses the verified fallback without logging when the request fails', async () => {
		const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new Error('offline'));
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		expect(await useGithubStars(fetcher)).toBe(PORT_STARS_FALLBACK);
		expect(error).not.toHaveBeenCalled();

		error.mockRestore();
	});
});
