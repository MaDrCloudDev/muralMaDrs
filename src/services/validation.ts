import { z } from 'zod';

import { sanitizeText } from './sanitize';

const cleanString = (min: number, max: number) =>
	z
		.string()
		.min(min)
		.max(max)
		.transform((value) => sanitizeText(value));

export const muralInputSchema = z.object({
	title: cleanString(2, 140),
	artist: cleanString(2, 120),
	location: cleanString(3, 180),
	description: cleanString(10, 3000),
});

export const reviewInputSchema = z.object({
	body: cleanString(3, 1500),
	rating: z.coerce.number().int().min(1).max(5),
});

export const registerInputSchema = z.object({
	username: z
		.string()
		.min(3)
		.max(32)
		.regex(/^[a-zA-Z0-9_.-]+$/, {
			message:
				'Username can only include letters, numbers, periods, underscores, and dashes.',
		})
		.transform((value) => sanitizeText(value)),
	email: z.string().email().transform((value) => value.trim().toLowerCase()),
	password: z.string().min(8).max(128),
});

export const loginInputSchema = z.object({
	username: z.string().min(1).max(64).transform((value) => sanitizeText(value)),
	password: z.string().min(1).max(128),
	returnTo: z.string().optional(),
});
