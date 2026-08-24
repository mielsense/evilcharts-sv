import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	PORT_REPO_API_URL,
	PORT_REPO_URL,
	PORT_STARS_FALLBACK,
	formatGithubStarsLabel
} from '$site/globals/constants/site.js';

function response(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

describe('useGithubStars', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-08-24T12:00:00Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	async function loadUseGithubStars() {
		return (await import('./use-github-stars.server.js')).useGithubStars;
	}

	it.each([
		[0, '0 GitHub stars'],
		[1, '1 GitHub star'],
		[2, '2 GitHub stars']
	])('formats %i for assistive technology', (stars, label) => {
		expect(formatGithubStarsLabel(stars)).toBe(label);
	});

	it('returns the numeric star count from the port repository', async () => {
		const useGithubStars = await loadUseGithubStars();
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
		const useGithubStars = await loadUseGithubStars();
		const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({ stargazers_count: 0 }));

		expect(await useGithubStars(fetcher)).toBe(0);
		expect(await useGithubStars(fetcher)).toBe(0);
		expect(fetcher).toHaveBeenCalledTimes(1);
	});

	it('serves a cached count until its TTL expires, then refreshes it', async () => {
		const useGithubStars = await loadUseGithubStars();
		const fetcher = vi
			.fn<typeof fetch>()
			.mockResolvedValueOnce(response({ stargazers_count: 4 }))
			.mockResolvedValueOnce(response({ stargazers_count: 5 }));

		expect(await useGithubStars(fetcher)).toBe(4);
		vi.advanceTimersByTime(59 * 60_000);
		expect(await useGithubStars(fetcher)).toBe(4);
		expect(fetcher).toHaveBeenCalledTimes(1);

		vi.advanceTimersByTime(2 * 60_000);
		expect(await useGithubStars(fetcher)).toBe(5);
		expect(fetcher).toHaveBeenCalledTimes(2);
	});

	it('deduplicates concurrent refreshes', async () => {
		const useGithubStars = await loadUseGithubStars();
		let resolveResponse: ((response: Response) => void) | undefined;
		const pending = new Promise<Response>((resolve) => {
			resolveResponse = resolve;
		});
		const fetcher = vi.fn<typeof fetch>().mockReturnValue(pending);

		const first = useGithubStars(fetcher);
		const second = useGithubStars(fetcher);
		expect(fetcher).toHaveBeenCalledTimes(1);

		resolveResponse?.(response({ stargazers_count: 6 }));
		expect(await Promise.all([first, second])).toEqual([6, 6]);
	});

	it.each([
		['an HTTP failure', response({ message: 'rate limited' }, 403)],
		['a malformed payload', response({ stargazers_count: 'many' })]
	])('uses the verified fallback for %s', async (_case, result) => {
		const useGithubStars = await loadUseGithubStars();
		const fetcher = vi.fn<typeof fetch>().mockResolvedValue(result);

		expect(await useGithubStars(fetcher)).toBe(PORT_STARS_FALLBACK);
		expect(await useGithubStars(fetcher)).toBe(PORT_STARS_FALLBACK);
		expect(fetcher).toHaveBeenCalledTimes(1);
	});

	it('uses the verified fallback without logging when the request fails', async () => {
		const useGithubStars = await loadUseGithubStars();
		const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new Error('offline'));
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		expect(await useGithubStars(fetcher)).toBe(PORT_STARS_FALLBACK);
		expect(error).not.toHaveBeenCalled();
	});

	it('serves the last known count when an expired refresh fails, then retries later', async () => {
		const useGithubStars = await loadUseGithubStars();
		const fetcher = vi
			.fn<typeof fetch>()
			.mockResolvedValueOnce(response({ stargazers_count: 7 }))
			.mockResolvedValueOnce(response({ message: 'rate limited' }, 403))
			.mockResolvedValueOnce(response({ stargazers_count: 8 }));

		expect(await useGithubStars(fetcher)).toBe(7);
		vi.advanceTimersByTime(61 * 60_000);
		expect(await useGithubStars(fetcher)).toBe(7);
		expect(await useGithubStars(fetcher)).toBe(7);
		expect(fetcher).toHaveBeenCalledTimes(2);

		vi.advanceTimersByTime(2 * 60_000);
		expect(await useGithubStars(fetcher)).toBe(8);
		expect(fetcher).toHaveBeenCalledTimes(3);
	});
});
