import type { Child } from 'hono/jsx';
import type { Context } from 'hono';

import { env } from '../config/env';
import { consumeFlash } from '../services/flash';
import type { AppBindings } from '../types';
import { Layout } from './components/layout';

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
