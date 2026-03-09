import mongoose from 'mongoose';

import { env } from './env.js';

let cachedConnection: typeof mongoose | null = null;

export async function connectToDatabase(): Promise<typeof mongoose> {
	if (cachedConnection) {
		return cachedConnection;
	}

	cachedConnection = await mongoose.connect(env.DB_URL, {
		autoIndex: true,
	});

	return cachedConnection;
}
