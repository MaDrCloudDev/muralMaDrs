import { Hono } from 'hono';

import { renderPage } from '../views/render.js';
import { HomePage } from '../views/pages/home.js';
import type { AppBindings } from '../types.js';

export const homeRoutes = new Hono<AppBindings>();

homeRoutes.get('/', (c) => {
	return renderPage(c, <HomePage currentUser={c.get('currentUser')} />, {
		title: 'Home',
	});
});
