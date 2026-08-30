import { beforeEach, describe, expect, it, vi } from 'vitest';

const { ingest } = vi.hoisted(() => ({
	ingest: vi.fn(async () => undefined)
}));

vi.mock('$site/lib/axiom.js', async (importOriginal) => ({
	...(await importOriginal<typeof import('$site/lib/axiom.js')>()),
	ingest
}));

import { handle } from './hooks.server.js';
import { sanitizeAnalyticsContext } from '$site/lib/axiom.js';

type EventOptions = {
	pathname?: string;
	accept?: string;
	headers?: Record<string, string>;
	fetchVary?: string;
};

function eventFor({
	pathname = '/docs/layerchart/area-chart',
	accept,
	headers = {},
	fetchVary
}: EventOptions = {}) {
	const requestHeaders = new Headers(headers);
	if (accept !== undefined) requestHeaders.set('Accept', accept);

	return {
		url: new URL(pathname, 'https://evilcharts-sv.vercel.app'),
		request: new Request(new URL(pathname, 'https://evilcharts-sv.vercel.app'), {
			headers: requestHeaders
		}),
		fetch: vi.fn(
			async (path: string) =>
				new Response(`# ${path}`, {
					headers: {
						'Content-Type': 'text/markdown',
						...(fetchVary ? { Vary: fetchVary } : {})
					}
				})
		)
	};
}

function varyValues(response: Response) {
	return (response.headers.get('vary') ?? '')
		.split(',')
		.map((value) => value.trim())
		.filter(Boolean);
}

describe('docs content negotiation', () => {
	beforeEach(() => {
		ingest.mockClear();
	});

	it.each([
		['/docs', '/docs.md'],
		['/docs/layerchart/area-chart', '/docs/layerchart/area-chart.md']
	])('serves the Markdown mirror for canonical route %s', async (pathname, markdownPath) => {
		const event = eventFor({ pathname, accept: 'text/markdown' });
		const resolve = vi.fn(async () => new Response('<html></html>'));
		const response = await handle({ event, resolve } as never);

		expect(event.fetch).toHaveBeenCalledWith(markdownPath);
		expect(resolve).not.toHaveBeenCalled();
		expect(response.headers.get('content-type')).toContain('text/markdown');
		expect(varyValues(response)).toContain('Accept');
	});

	it.each([
		'text/markdown',
		'text/html;q=0.4, text/markdown;q=0.8',
		'text/html;q=0.4, text/*;q=0.8',
		'text/html;q=0.4, */*;q=0.8',
		'text/html;q=0, */*;q=0.8',
		'text/markdown;q=0.8, text/html;q=0.4'
	])('prefers Markdown for Accept: %s', async (accept) => {
		const event = eventFor({ accept });
		const resolve = vi.fn(async () => new Response('<html></html>'));

		await handle({ event, resolve } as never);

		expect(event.fetch).toHaveBeenCalledOnce();
		expect(resolve).not.toHaveBeenCalled();
	});

	it.each([
		undefined,
		'text/markdown;q=0',
		'text/markdown;q=0, */*;q=1',
		'text/html, text/markdown',
		'text/*',
		'*/*',
		'text/markdown;q=0.4, text/html;q=0.8',
		'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
	])('keeps HTML for Accept: %s', async (accept) => {
		const event = eventFor({ accept });
		const response = await handle({
			event,
			resolve: vi.fn(async () => new Response('<html></html>'))
		} as never);

		expect(await response.text()).toBe('<html></html>');
		expect(event.fetch).not.toHaveBeenCalled();
		expect(varyValues(response)).toContain('Accept');
	});

	it('does not treat a docs-prefixed route as a canonical docs route', async () => {
		const event = eventFor({ pathname: '/docs-anything', accept: 'text/markdown' });
		const response = await handle({
			event,
			resolve: vi.fn(async () => new Response('<html></html>'))
		} as never);

		expect(await response.text()).toBe('<html></html>');
		expect(event.fetch).not.toHaveBeenCalled();
		expect(varyValues(response)).not.toContain('Accept');
	});

	it.each(['text/html', 'text/markdown'])(
		'merges Vary for canonical %s responses',
		async (accept) => {
			const event = eventFor({ accept, fetchVary: 'Origin' });
			const response = await handle({
				event,
				resolve: vi.fn(async () => new Response('<html></html>', { headers: { Vary: 'Origin' } }))
			} as never);

			expect(varyValues(response)).toEqual(['Origin', 'Accept']);
		}
	);

	it('adds Vary without mutating an immutable response', async () => {
		const event = eventFor({ accept: 'text/html' });
		const original = await fetch('data:text/plain,immutable-body');

		const response = await handle({
			event,
			resolve: vi.fn(async () => original)
		} as never);

		expect(response).not.toBe(original);
		expect(response.status).toBe(original.status);
		expect(response.statusText).toBe(original.statusText);
		expect(response.headers.get('content-type')).toBe(original.headers.get('content-type'));
		expect(response.headers.get('vary')).toBe('Accept');
		expect(original.headers.get('vary')).toBeNull();
		expect(await response.text()).toBe('immutable-body');
	});

	it('leaves Vary wildcard responses unchanged', async () => {
		const event = eventFor({ accept: 'text/html' });
		const original = new Response('<html></html>', { headers: { Vary: '*' } });

		const response = await handle({
			event,
			resolve: vi.fn(async () => original)
		} as never);

		expect(response).toBe(original);
		expect(response.headers.get('vary')).toBe('*');
	});
});

describe('analytics metadata', () => {
	beforeEach(() => {
		ingest.mockClear();
	});

	it('keeps only a normalized referrer origin and two-letter country code', () => {
		expect(
			sanitizeAnalyticsContext({
				userAgent: 'ExampleBrowser/123 private-agent-detail',
				country: 'fr',
				referer:
					'https://demo-user:demo-password@source.example.test:8443/docs/chart?sample=value#section'
			})
		).toEqual({
			country: 'FR',
			referer: 'https://source.example.test:8443'
		});
	});

	it('drops invalid and oversized analytics headers', () => {
		expect(
			sanitizeAnalyticsContext({
				userAgent: 'ExampleBrowser/123 private-agent-detail',
				country: 'FRA',
				referer: 'not a URL'
			})
		).toEqual({});
		expect(
			sanitizeAnalyticsContext({
				userAgent: null,
				country: 'éa',
				referer: `https://source.example.test/${'oversized-marker'.repeat(64)}`
			})
		).toEqual({});
	});

	it.each([
		{
			pathname: '/r/layerchart-area.json',
			accept: undefined,
			expected: { event: 'registry_install', component: 'layerchart-area' }
		},
		{
			pathname: '/docs/layerchart/area-chart',
			accept: 'text/markdown',
			expected: { event: 'docs_markdown_fetch', slug: 'layerchart/area-chart' }
		}
	])(
		'sanitizes metadata passed to ingest for $expected.event',
		async ({ pathname, accept, expected }) => {
			const event = eventFor({
				pathname,
				accept,
				headers: {
					'User-Agent': 'ExampleBrowser/123 private-agent-detail',
					Referer: 'https://source.example.test/private?sample=value',
					'X-Vercel-IP-Country': 'fr'
				}
			});

			await handle({ event, resolve: vi.fn(async () => new Response('ok')) } as never);

			expect(ingest).toHaveBeenCalledWith([
				{
					...expected,
					country: 'FR',
					referer: 'https://source.example.test'
				}
			]);
			expect(JSON.stringify(ingest.mock.calls)).not.toContain('private-agent-detail');
			expect(JSON.stringify(ingest.mock.calls)).not.toContain('/private');
		}
	);
});
