import { describe, expect, it, vi } from 'vitest';
import { handle } from './hooks.server.js';

function eventFor(accept: string) {
	return {
		url: new URL('https://evilcharts-sv.vercel.app/docs/layerchart/area-chart'),
		request: new Request('https://evilcharts-sv.vercel.app/docs/layerchart/area-chart', {
			headers: { Accept: accept }
		}),
		fetch: vi.fn(
			async (path: string) =>
				new Response(`# ${path}`, { headers: { 'Content-Type': 'text/markdown' } })
		)
	};
}

describe('docs content negotiation', () => {
	it('serves the Markdown mirror from the canonical docs URL', async () => {
		const event = eventFor('text/markdown');
		const resolve = vi.fn(async () => new Response('<html></html>'));
		const response = await handle({ event, resolve } as never);

		expect(event.fetch).toHaveBeenCalledWith('/docs/layerchart/area-chart.md');
		expect(resolve).not.toHaveBeenCalled();
		expect(response.headers.get('content-type')).toContain('text/markdown');
	});

	it('keeps HTML responses cache-safe', async () => {
		const event = eventFor('text/html');
		const response = await handle({
			event,
			resolve: vi.fn(async () => new Response('<html></html>'))
		} as never);

		expect(await response.text()).toBe('<html></html>');
		expect(response.headers.get('vary')).toContain('Accept');
	});
});
