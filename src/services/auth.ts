import { createHash, randomBytes } from 'node:crypto';

import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import type { Context } from 'hono';
import type { Types } from 'mongoose';

import { env } from '../config/env';
import { Session } from '../models/session';
import { User, type UserDocument } from '../models/user';
import type { AppBindings } from '../types';

const SESSION_MAX_AGE = env.SESSION_TTL_DAYS * 24 * 60 * 60;

function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

function generateSessionToken(): string {
	return randomBytes(48).toString('base64url');
}

function setSessionCookie(c: Context<AppBindings>, token: string): void {
	setCookie(c, env.SESSION_COOKIE_NAME, token, {
		httpOnly: true,
		sameSite: 'Lax',
		secure: env.isProduction,
		maxAge: SESSION_MAX_AGE,
		path: '/',
	});
}

export async function createSession(
	c: Context<AppBindings>,
	userId: Types.ObjectId
): Promise<void> {
	const token = generateSessionToken();
	const tokenHash = hashToken(token);

	await Session.create({
		tokenHash,
		user: userId,
		expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000),
	});

	setSessionCookie(c, token);
}

export async function destroySession(c: Context<AppBindings>): Promise<void> {
	const token = getCookie(c, env.SESSION_COOKIE_NAME);

	if (token) {
		await Session.findOneAndDelete({ tokenHash: hashToken(token) });
	}

	deleteCookie(c, env.SESSION_COOKIE_NAME, { path: '/' });
}

export async function getUserFromSession(
	c: Context<AppBindings>
): Promise<UserDocument | null> {
	const token = getCookie(c, env.SESSION_COOKIE_NAME);

	if (!token) {
		return null;
	}

	const session = await Session.findOne({
		tokenHash: hashToken(token),
		expiresAt: { $gt: new Date() },
	}).populate<{ user: UserDocument }>('user');

	if (!session?.user) {
		deleteCookie(c, env.SESSION_COOKIE_NAME, { path: '/' });
		return null;
	}

	return session.user;
}

export async function authenticateLocalUser(
	username: string,
	password: string
): Promise<UserDocument | null> {
	const authenticate = User.authenticate();

	return await new Promise<UserDocument | null>((resolve, reject) => {
		authenticate(
			username,
			password,
			(error: unknown, user: UserDocument | false | null) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(user || null);
			}
		);
	});
}
