import { Hono } from 'hono';
import { compress } from 'hono/compress';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';

import { env } from './config/env.js';
import { loadCurrentUser } from './middleware/auth.js';
import { authRoutes } from './routes/auth.js';
import { homeRoutes } from './routes/home.js';
import { muralRoutes } from './routes/murals.js';
import type { AppBindings } from './types.js';
import { ErrorPage } from './views/pages/error.js';
import { renderPage } from './views/render.js';

const app = new Hono<AppBindings>();

app.use('*', logger());
app.use('*', compress());
app.use(
	'*',
	secureHeaders({
		contentSecurityPolicy: {
			defaultSrc: ["'self'"],
			imgSrc: [
				"'self'",
				'data:',
				'blob:',
				'https://res.cloudinary.com',
				'https://images.unsplash.com',
			],
			scriptSrc: [
				"'self'",
				"'unsafe-inline'",
				'https://api.mapbox.com',
				'https://cdnjs.cloudflare.com',
			],
			styleSrc: [
				"'self'",
				"'unsafe-inline'",
				'https://fonts.googleapis.com',
				'https://api.mapbox.com',
				'https://cdnjs.cloudflare.com',
			],
			fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
			connectSrc: [
				"'self'",
				'https://api.mapbox.com',
				'https://events.mapbox.com',
				'https://*.tiles.mapbox.com',
				'https://*.mapbox.com',
			],
			workerSrc: ["'self'", 'blob:'],
			childSrc: ['blob:'],
			objectSrc: ["'none'"],
			baseUri: ["'self'"],
			frameAncestors: ["'none'"],
		},
		crossOriginEmbedderPolicy: false,
	})
);

app.use('*', loadCurrentUser);

app.get('/health', (c) => c.json({ ok: true, env: env.NODE_ENV }));

app.route('/', homeRoutes);
app.route('/', authRoutes);
app.route('/', muralRoutes);

app.notFound((c) => {
	return renderPage(c, ErrorPage({ statusCode: 404, message: 'Page not found' }), {
		title: 'Not Found',
	});
});

app.onError((error, c) => {
	console.error(error);
	const statusCode = 500;
	const details = env.NODE_ENV === 'production' ? undefined : error.stack;

	return renderPage(
		c,
		ErrorPage({ statusCode, message: 'Something went wrong', details }),
		{
			title: 'Error',
		}
	);
});

export default app;
