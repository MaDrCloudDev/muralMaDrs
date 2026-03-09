import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import type { Context } from 'hono';

import type { AppBindings, FlashMessages } from '../types';

const FLASH_COOKIE_NAME = 'muralmadrs_flash';

const emptyFlash: FlashMessages = {
	success: [],
	error: [],
};

function decodeFlash(cookieValue: string | undefined): FlashMessages {
	if (!cookieValue) {
		return { ...emptyFlash };
	}

	try {
		const parsed = JSON.parse(cookieValue) as Partial<FlashMessages>;
		return {
			success: Array.isArray(parsed.success)
				? parsed.success.filter(Boolean)
				: [],
			error: Array.isArray(parsed.error)
				? parsed.error.filter(Boolean)
				: [],
		};
	} catch {
		return { ...emptyFlash };
	}
}

function encodeFlash(messages: FlashMessages): string {
	return JSON.stringify(messages);
}

function persistFlash(c: Context<AppBindings>, messages: FlashMessages): void {
	if (!messages.success.length && !messages.error.length) {
		deleteCookie(c, FLASH_COOKIE_NAME, { path: '/' });
		return;
	}

	setCookie(c, FLASH_COOKIE_NAME, encodeFlash(messages), {
		httpOnly: true,
		sameSite: 'Lax',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		maxAge: 60,
	});
}

export function pushFlash(
	c: Context<AppBindings>,
	type: keyof FlashMessages,
	message: string
): void {
	const existing = decodeFlash(getCookie(c, FLASH_COOKIE_NAME));
	existing[type].push(message);
	persistFlash(c, existing);
}

export function consumeFlash(c: Context<AppBindings>): FlashMessages {
	const messages = decodeFlash(getCookie(c, FLASH_COOKIE_NAME));
	deleteCookie(c, FLASH_COOKIE_NAME, { path: '/' });
	return messages;
}
