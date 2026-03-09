import { env } from '../config/env.js';

const DEFAULT_COORDINATES: [number, number] = [-98.5795, 39.8283];

export async function geocodeLocation(location: string): Promise<[number, number]> {
	if (!env.MAPBOX_TOKEN) {
		return DEFAULT_COORDINATES;
	}

	const endpoint = new URL(
		`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
			location
		)}.json`
	);
	endpoint.searchParams.set('limit', '1');
	endpoint.searchParams.set('access_token', env.MAPBOX_TOKEN);

	try {
		const response = await fetch(endpoint, {
			headers: { Accept: 'application/json' },
		});

		if (!response.ok) {
			return DEFAULT_COORDINATES;
		}

		const payload = (await response.json()) as {
			features?: Array<{ center?: [number, number] }>;
		};

		const coordinates = payload.features?.[0]?.center;

		if (
			coordinates &&
			typeof coordinates[0] === 'number' &&
			typeof coordinates[1] === 'number'
		) {
			return coordinates;
		}

		return DEFAULT_COORDINATES;
	} catch {
		return DEFAULT_COORDINATES;
	}
}
