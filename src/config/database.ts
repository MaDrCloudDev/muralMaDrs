import mongoose from 'mongoose';

import { env } from './env.js';

let cachedConnection: typeof mongoose | null = null;
let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectToDatabase(): Promise<typeof mongoose> {
	if (cachedConnection && mongoose.connection.readyState === 1) {
		return cachedConnection;
	}

	if (connectionPromise) {
		return connectionPromise;
	}

	connectionPromise = mongoose
		.connect(env.DB_URL, {
			autoIndex: !env.isProduction,
			serverSelectionTimeoutMS: 10_000,
		})
		.then((connection) => {
			cachedConnection = connection;
			return connection;
		})
		.catch((error) => {
			cachedConnection = null;
			throw error;
		})
		.finally(() => {
			connectionPromise = null;
		});

	return connectionPromise;
}
