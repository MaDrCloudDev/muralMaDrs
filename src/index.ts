import { Hono } from 'hono';

import app from './app.js';

if (!(app instanceof Hono)) {
	throw new TypeError('Expected the default app export to be a Hono instance.');
}

export default app;
