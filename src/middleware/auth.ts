import { createMiddleware } from 'hono/factory';

import { getUserFromSession } from '../services/auth';
import { pushFlash } from '../services/flash';
import type { AppBindings } from '../types';

export const loadCurrentUser = createMiddleware<AppBindings>(
	async (c, next) => {
		const user = await getUserFromSession(c);
		c.set('currentUser', user);
		await next();
	}
);

export const requireAuth = createMiddleware<AppBindings>(
	async (c, next) => {
		const user = c.get('currentUser');
		if (!user) {
			pushFlash(c, 'error', 'You must be signed in to continue.');
			const destination = encodeURIComponent(c.req.path);
			return c.redirect(`/login?returnTo=${destination}`);
		}

		await next();
	}
);
