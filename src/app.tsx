import { Hono } from 'hono';
import { compress } from 'hono/compress';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { serveStatic } from '@hono/node-server/serve-static';

import { env } from './config/env';
import { loadCurrentUser } from './middleware/auth';
import { authRoutes } from './routes/auth';
import { homeRoutes } from './routes/home';
import { muralRoutes } from './routes/murals';
import type { AppBindings } from './types';
import { ErrorPage } from './views/pages/error';
import { renderPage } from './views/render';

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

app.get('/favicon.ico', serveStatic({ path: './public/favicon.ico' }));
app.use('/stylesheets/*', serveStatic({ root: './public' }));
app.use('/javascripts/*', serveStatic({ root: './public' }));
app.use('/uploads/*', serveStatic({ root: './public' }));

app.use('*', loadCurrentUser);

app.get('/health', (c) => c.json({ ok: true, env: env.NODE_ENV }));

app.route('/', homeRoutes);
app.route('/', authRoutes);
app.route('/', muralRoutes);

app.notFound((c) => {
	return renderPage(
		c,
		<ErrorPage statusCode={404} message="Page not found" />,
		{
			title: 'Not Found',
		}
	);
});

app.onError((error, c) => {
	console.error(error);
	const statusCode = 500;
	const details = env.NODE_ENV === 'production' ? undefined : error.stack;

	return renderPage(
		c,
		<ErrorPage statusCode={statusCode} message="Something went wrong" details={details} />,
		{
			title: 'Error',
		}
	);
});

export default app;
