import type { Child } from 'hono/jsx';
import type { Context } from 'hono';

import { env } from '../config/env.js';
import { consumeFlash } from '../services/flash.js';
import type { AppBindings } from '../types.js';
import { Layout } from './components/layout.js';

interface RenderPageOptions {
	title: string;
	currentPath?: string;
	mapbox?: boolean;
	extraScripts?: string[];
}

export function renderPage(
	c: Context<AppBindings>,
	content: Child,
	options: RenderPageOptions
): Response | Promise<Response> {
	const flash = consumeFlash(c);
	const currentUser = c.get('currentUser') ?? null;

	return c.html(
		<Layout
			title={options.title}
			currentPath={options.currentPath ?? c.req.path}
			currentUser={currentUser}
			flash={flash}
			includeMapboxAssets={Boolean(options.mapbox)}
			mapboxToken={options.mapbox ? env.MAPBOX_TOKEN : undefined}
			extraScripts={options.extraScripts}
		>
			{content}
		</Layout>
	);
}
