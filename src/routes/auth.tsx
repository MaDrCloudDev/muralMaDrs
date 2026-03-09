import { Hono } from 'hono';

import { User } from '../models/user.js';
import { createSession, destroySession, authenticateLocalUser } from '../services/auth.js';
import { pushFlash } from '../services/flash.js';
import { getStringField, isSafeReturnTo } from '../services/http.js';
import { loginInputSchema, registerInputSchema } from '../services/validation.js';
import type { AppBindings } from '../types.js';
import { LoginPage } from '../views/pages/auth/login.js';
import { RegisterPage } from '../views/pages/auth/register.js';
import { renderPage } from '../views/render.js';

export const authRoutes = new Hono<AppBindings>();

authRoutes.get('/register', (c) => {
	if (c.get('currentUser')) {
		return c.redirect('/murals');
	}

	return renderPage(c, <RegisterPage />, {
		title: 'Register',
	});
});

authRoutes.post('/register', async (c) => {
	const body = await c.req.parseBody();
	const parsed = registerInputSchema.safeParse({
		username: getStringField(body.username),
		email: getStringField(body.email),
		password: getStringField(body.password),
	});

	if (!parsed.success) {
		pushFlash(c, 'error', parsed.error.issues[0]?.message ?? 'Invalid registration form.');
		return c.redirect('/register');
	}

	try {
		const { username, email, password } = parsed.data;
		const user = new User({ username, email });
		const registeredUser = await User.register(user, password);

		await createSession(c, registeredUser._id);
		pushFlash(c, 'success', 'Welcome to muralMaDrs.');

		return c.redirect('/murals');
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: 'Could not create account. Please try another username.';
		pushFlash(c, 'error', message);
		return c.redirect('/register');
	}
});

authRoutes.get('/login', (c) => {
	if (c.get('currentUser')) {
		return c.redirect('/murals');
	}

	const returnTo = c.req.query('returnTo');

	return renderPage(c, <LoginPage returnTo={isSafeReturnTo(returnTo) ? returnTo : undefined} />, {
		title: 'Login',
	});
});

authRoutes.post('/login', async (c) => {
	const body = await c.req.parseBody();
	const parsed = loginInputSchema.safeParse({
		username: getStringField(body.username),
		password: getStringField(body.password),
		returnTo: getStringField(body.returnTo, ''),
	});

	if (!parsed.success) {
		pushFlash(c, 'error', 'Please provide a username and password.');
		return c.redirect('/login');
	}

	const { username, password, returnTo } = parsed.data;
	const user = await authenticateLocalUser(username, password);

	if (!user) {
		pushFlash(c, 'error', 'Invalid username or password.');
		return c.redirect('/login');
	}

	await createSession(c, user._id);
	pushFlash(c, 'success', `Welcome back, ${user.username}.`);

	if (isSafeReturnTo(returnTo)) {
		return c.redirect(returnTo);
	}

	return c.redirect('/murals');
});

authRoutes.post('/logout', async (c) => {
	await destroySession(c);
	pushFlash(c, 'success', 'You have been signed out.');
	return c.redirect('/murals');
});
