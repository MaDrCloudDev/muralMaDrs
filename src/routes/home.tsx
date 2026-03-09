import { Hono } from 'hono';

import { renderPage } from '../views/render';
import { HomePage } from '../views/pages/home';
import type { AppBindings } from '../types';

export const homeRoutes = new Hono<AppBindings>();

homeRoutes.get('/', (c) => {
	return renderPage(c, <HomePage currentUser={c.get('currentUser')} />, {
		title: 'Home',
	});
});
