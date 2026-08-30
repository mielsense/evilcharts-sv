/**
 * Optional Axiom ingest, harmless when unconfigured.
 *
 * Ported from `evilcharts/src/lib/axiom.ts`. The reference wraps `@axiomhq/js`; that package is not
 * a dependency here, so the one call it makes — `POST /v1/datasets/<dataset>/ingest` — is issued
 * with `fetch` instead. Same contract: with no `AXIOM_TOKEN` (or no `AXIOM_DATASET`) this is a
 * no-op that never throws, and no request is made.
 *
 * Read through `$env/dynamic/private` so the values are resolved at runtime and never inlined into
 * a build artefact.
 */
import { env } from '$env/dynamic/private';

const INGEST_ORIGIN = 'https://api.axiom.co';
const MAX_REFERER_LENGTH = 512;

type RawAnalyticsContext = {
	userAgent: string | null;
	country: string | null;
	referer: string | null;
};

/**
 * Analytics events may add only these request fields:
 *
 * - `country`: an uppercase two-letter ASCII country code;
 * - `referer`: an HTTP(S) origin with no credentials, path, query, or fragment.
 *
 * User-agent strings are intentionally omitted because raw device detail is not needed.
 */
export function sanitizeAnalyticsContext({
	country,
	referer
}: RawAnalyticsContext): Record<string, string> {
	const context: Record<string, string> = {};

	if (country && /^[A-Za-z]{2}$/.test(country)) {
		context.country = country.toUpperCase();
	}

	if (referer && referer.length <= MAX_REFERER_LENGTH) {
		try {
			const url = new URL(referer);
			if (url.protocol === 'http:' || url.protocol === 'https:') {
				context.referer = url.origin;
			}
		} catch {
			// Invalid referrers are omitted from analytics.
		}
	}

	return context;
}

export function isAxiomConfigured(): boolean {
	return Boolean(env.AXIOM_TOKEN && env.AXIOM_DATASET);
}

/**
 * Sends one or more events. Returns a promise the caller hands to Vercel's `waitUntil`, mirroring
 * the reference's `event.waitUntil(axiom.flush())` without delaying the response.
 *
 * Failures are swallowed: analytics must never break a page.
 */
export async function ingest(events: Record<string, unknown>[]): Promise<void> {
	if (!isAxiomConfigured() || events.length === 0) return;

	try {
		await fetch(`${INGEST_ORIGIN}/v1/datasets/${env.AXIOM_DATASET}/ingest`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.AXIOM_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(events)
		});
	} catch {
		// Analytics is best-effort; a failed ingest is not an error worth surfacing.
	}
}
