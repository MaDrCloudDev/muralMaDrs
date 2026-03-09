import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z
		.string()
		.transform((value) => value.toLowerCase())
		.pipe(z.enum(['development', 'test', 'production']))
		.default('development'),
	PORT: z.coerce.number().int().positive().default(3000),
	DB_URL: z.string().min(1).default('mongodb://127.0.0.1:27017/mural-madrs'),
	SESSION_COOKIE_NAME: z.string().min(1).default('muralmadrs_session'),
	SESSION_TTL_DAYS: z.coerce.number().int().positive().default(7),
	SECRET: z.string().min(1, 'SECRET is required'),
	CLOUDINARY_CLOUD_NAME: z.string().optional(),
	CLOUDINARY_KEY: z.string().optional(),
	CLOUDINARY_SECRET: z.string().optional(),
	MAPBOX_TOKEN: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
	const formattedErrors = parsedEnv.error.issues
		.map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
		.join('\n');

	throw new Error(`Invalid environment configuration:\n${formattedErrors}`);
}

export const env = {
	...parsedEnv.data,
	isProduction: parsedEnv.data.NODE_ENV === 'production',
	hasCloudinary:
		Boolean(parsedEnv.data.CLOUDINARY_CLOUD_NAME) &&
		Boolean(parsedEnv.data.CLOUDINARY_KEY) &&
		Boolean(parsedEnv.data.CLOUDINARY_SECRET),
};

if (env.SECRET.length < 16) {
	console.warn(
		'[env] SECRET is shorter than 16 characters. Startup is allowed, but use a longer secret for real deployments.'
	);
}

export type AppEnv = typeof env;
