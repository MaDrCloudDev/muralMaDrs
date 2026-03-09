import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { v2 as cloudinary } from 'cloudinary';
import type { Context } from 'hono';

import { env } from '../config/env';
import type { AppBindings } from '../types';

const uploadRoot = path.join(process.cwd(), 'public', 'uploads');

if (env.hasCloudinary) {
	cloudinary.config({
		cloud_name: env.CLOUDINARY_CLOUD_NAME,
		api_key: env.CLOUDINARY_KEY,
		api_secret: env.CLOUDINARY_SECRET,
	});
}

export interface UploadedImage {
	url: string;
	filename: string;
}

function extensionFromFilename(filename: string): string {
	const ext = path.extname(filename).toLowerCase();
	if (!ext.match(/^\.[a-z0-9]+$/)) {
		return '.jpg';
	}
	return ext;
}

async function uploadToCloudinary(file: File): Promise<UploadedImage> {
	const fileBuffer = Buffer.from(await file.arrayBuffer());

	return await new Promise<UploadedImage>((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{
				folder: 'muralMaDrs',
				resource_type: 'image',
			},
			(error, result) => {
				if (error || !result) {
					reject(error ?? new Error('Cloudinary upload failed'));
					return;
				}

				resolve({
					url: result.secure_url,
					filename: result.public_id,
				});
			}
		);

		stream.end(fileBuffer);
	});
}

async function saveLocally(file: File): Promise<UploadedImage> {
	await mkdir(uploadRoot, { recursive: true });

	const ext = extensionFromFilename(file.name);
	const filename = `local-${Date.now()}-${randomUUID()}${ext}`;
	const outputPath = path.join(uploadRoot, filename);

	await writeFile(outputPath, Buffer.from(await file.arrayBuffer()));

	return {
		url: `/uploads/${filename}`,
		filename,
	};
}

export async function uploadImages(files: File[]): Promise<UploadedImage[]> {
	const filteredFiles = files.filter((file) =>
		file.type.startsWith('image/')
	);

	if (!filteredFiles.length) {
		return [];
	}

	if (env.hasCloudinary) {
		return await Promise.all(filteredFiles.map(uploadToCloudinary));
	}

	return await Promise.all(filteredFiles.map(saveLocally));
}

export async function deleteImage(filename: string): Promise<void> {
	if (env.hasCloudinary) {
		await cloudinary.uploader.destroy(filename).catch(() => undefined);
		return;
	}

	const safeFilename = path.basename(filename);
	const localPath = path.join(uploadRoot, safeFilename);
	await unlink(localPath).catch(() => undefined);
}

export function extractFilesFromBody(
	body: Record<string, unknown>,
	fieldName: string
): File[] {
	const entry = body[fieldName];

	if (!entry) {
		return [];
	}

	if (entry instanceof File) {
		return [entry];
	}

	if (Array.isArray(entry)) {
		return entry.filter((value): value is File => value instanceof File);
	}

	return [];
}

export async function parseMultipartBody(
	c: Context<AppBindings>
): Promise<Record<string, unknown>> {
	return await c.req.parseBody({ all: true });
}
