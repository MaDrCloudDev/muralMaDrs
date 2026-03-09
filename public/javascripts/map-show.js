/* global mapboxgl */

const mapContainer = document.getElementById('mural-map');
const tokenMeta = document.querySelector('meta[name="mapbox-token"]');
const dataElement = document.getElementById('mural-map-data');
const DEBUG_PREFIX = '[muralMaDrs map:show]';

function showMapMessage(target, message, details = '') {
	const detailText = details ? `<small>${details}</small>` : '';
	target.innerHTML = `<p class="muted map-fallback">${message}${detailText}</p>`;
}

function decodeHtmlEntities(value) {
	const textarea = document.createElement('textarea');
	textarea.innerHTML = value;
	return textarea.value;
}

function parseEmbeddedJson(rawText) {
	const trimmed = (rawText ?? '').trim();
	if (!trimmed) {
		return null;
	}

	try {
		return JSON.parse(trimmed);
	} catch {
		try {
			return JSON.parse(decodeHtmlEntities(trimmed));
		} catch {
			return null;
		}
	}
}

function logDebug(message, payload) {
	if (payload !== undefined) {
		console.error(`${DEBUG_PREFIX} ${message}`, payload);
		return;
	}
	console.error(`${DEBUG_PREFIX} ${message}`);
}

if (mapContainer && tokenMeta && dataElement) {
	const mapboxToken = tokenMeta.getAttribute('content') ?? '';
	let data = null;
	const tokenPrefix = mapboxToken.slice(0, 3);
	const tokenLength = mapboxToken.length;
	logDebug(`boot tokenPrefix=${tokenPrefix} tokenLength=${tokenLength}`);

	data = parseEmbeddedJson(dataElement.textContent ?? '');
	if (!data) {
		const rawPreview = (dataElement.textContent ?? '').slice(0, 160);
		logDebug('Map JSON parse failed');
		logDebug('Raw JSON preview', rawPreview);
		showMapMessage(mapContainer, 'Map data could not be parsed.', 'Embedded data was invalid JSON.');
	}

	if (!window.mapboxgl) {
		logDebug('window.mapboxgl unavailable');
		showMapMessage(mapContainer, 'Map library failed to load.');
	} else if (!mapboxToken) {
		logDebug('MAPBOX_TOKEN missing in page meta');
		showMapMessage(mapContainer, 'Map is disabled until a MAPBOX_TOKEN is configured.');
	} else if (!Array.isArray(data?.coordinates)) {
		logDebug('Invalid map coordinates payload', data);
		showMapMessage(mapContainer, 'Map coordinates are unavailable for this mural.');
	} else {
		try {
			mapboxgl.accessToken = mapboxToken;

			const map = new mapboxgl.Map({
				container: mapContainer,
				style: 'mapbox://styles/mapbox/dark-v11',
				center: data.coordinates,
				zoom: 12,
			});

			map.addControl(new mapboxgl.NavigationControl());
			map.on('load', () => {
				console.info(`${DEBUG_PREFIX} map load success`);
				map.resize();
			});
			map.on('error', (event) => {
				const reason =
					event?.error?.message ||
					event?.error?.status ||
					event?.type ||
					'unknown map error';
				logDebug('Mapbox emitted error event', event);
				showMapMessage(
					mapContainer,
					'Map failed to render.',
					`Reason: ${String(reason)}`
				);
			});

			new mapboxgl.Marker({ color: '#ea580c' })
				.setLngLat(data.coordinates)
				.setPopup(
					new mapboxgl.Popup({ offset: 24 }).setHTML(
						`<strong>${data.title}</strong><p>${data.location}</p>`
					)
				)
				.addTo(map);
		} catch (error) {
			logDebug('Map initialization exception', error);
			showMapMessage(
				mapContainer,
				'Map failed to initialize.',
				error instanceof Error ? error.message : String(error)
			);
		}
	}
}
