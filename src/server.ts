import { serve } from '@hono/node-server';

import app from './app';
import { connectToDatabase } from './config/database';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
	await connectToDatabase();

	serve(
		{
			fetch: app.fetch,
			port: env.PORT,
		},
		(info) => {
			console.log(`muralMaDrs running on http://localhost:${info.port}`);
		}
	);
}

bootstrap().catch((error) => {
	console.error('Failed to bootstrap server:', error);
	process.exit(1);
});
