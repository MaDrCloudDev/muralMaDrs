import { Hono } from 'hono';
import { Types } from 'mongoose';

import { Mural } from '../models/mural';
import { Review } from '../models/review';
import { deleteImage, extractFilesFromBody, parseMultipartBody, uploadImages } from '../services/uploads';
import { geocodeLocation } from '../services/geocoding';
import { pushFlash } from '../services/flash';
import { getStringArray, getStringField } from '../services/http';
import { muralInputSchema, reviewInputSchema } from '../services/validation';
import type { AppBindings } from '../types';
import { requireAuth } from '../middleware/auth';
import { MuralFormPage } from '../views/pages/murals/form';
import { MuralsIndexPage } from '../views/pages/murals/index';
import { MuralShowPage } from '../views/pages/murals/show';
import { renderPage } from '../views/render';

export const muralRoutes = new Hono<AppBindings>();

function isValidObjectId(id: string): boolean {
	return Types.ObjectId.isValid(id);
}

muralRoutes.get('/murals', async (c) => {
	const murals = await Mural.find({}).sort({ createdAt: -1 }).lean({ virtuals: true });

	return renderPage(
		c,
		<MuralsIndexPage murals={murals as any} currentUser={c.get('currentUser')} />,
		{
			title: 'Murals',
			mapbox: true,
			extraScripts: ['/javascripts/map-index.js'],
		}
	);
});

muralRoutes.get('/murals/new', requireAuth, (c) => {
	return renderPage(
		c,
		<MuralFormPage mode="create" action="/murals" />,
		{
			title: 'Add Mural',
		}
	);
});

muralRoutes.post('/murals', requireAuth, async (c) => {
	const body = await parseMultipartBody(c);
	const parsed = muralInputSchema.safeParse({
		title: getStringField(body.title),
		artist: getStringField(body.artist),
		location: getStringField(body.location),
		description: getStringField(body.description),
	});

	if (!parsed.success) {
		pushFlash(c, 'error', parsed.error.issues[0]?.message ?? 'Could not save mural.');
		return c.redirect('/murals/new');
	}

	const files = extractFilesFromBody(body, 'image');
	const images = await uploadImages(files);
	const coordinates = await geocodeLocation(parsed.data.location);
	const currentUser = c.get('currentUser');

	if (!currentUser) {
		pushFlash(c, 'error', 'You must be signed in to create a mural.');
		return c.redirect('/login');
	}

	const mural = await Mural.create({
		...parsed.data,
		images,
		geometry: {
			type: 'Point',
			coordinates,
		},
		author: currentUser._id,
	});

	pushFlash(c, 'success', 'Mural published successfully.');
	return c.redirect(`/murals/${mural._id}`);
});

muralRoutes.get('/murals/:id', async (c) => {
	const id = c.req.param('id');
	if (!isValidObjectId(id)) {
		pushFlash(c, 'error', 'Invalid mural id.');
		return c.redirect('/murals');
	}

	const mural = await Mural.findById(id)
		.populate('author')
		.populate({ path: 'reviews', populate: { path: 'author' } })
		.lean({ virtuals: true });

	if (!mural) {
		pushFlash(c, 'error', 'Mural not found.');
		return c.redirect('/murals');
	}

	return renderPage(
		c,
		<MuralShowPage mural={mural as any} currentUser={c.get('currentUser')} />,
		{
			title: mural.title,
			mapbox: true,
			extraScripts: ['/javascripts/map-show.js'],
		}
	);
});

muralRoutes.get('/murals/:id/edit', requireAuth, async (c) => {
	const id = c.req.param('id');
	if (!isValidObjectId(id)) {
		pushFlash(c, 'error', 'Invalid mural id.');
		return c.redirect('/murals');
	}

	const mural = await Mural.findById(id).lean({ virtuals: true });
	const currentUser = c.get('currentUser');

	if (!mural) {
		pushFlash(c, 'error', 'Mural not found.');
		return c.redirect('/murals');
	}

	if (!currentUser || String(mural.author) !== String(currentUser._id)) {
		pushFlash(c, 'error', 'You can only edit murals you created.');
		return c.redirect(`/murals/${id}`);
	}

	return renderPage(
		c,
		<MuralFormPage mode="edit" action={`/murals/${id}/update`} mural={mural as any} />,
		{
			title: `Edit ${mural.title}`,
		}
	);
});

muralRoutes.post('/murals/:id/update', requireAuth, async (c) => {
	const id = c.req.param('id');
	if (!isValidObjectId(id)) {
		pushFlash(c, 'error', 'Invalid mural id.');
		return c.redirect('/murals');
	}

	const mural = await Mural.findById(id);
	const currentUser = c.get('currentUser');

	if (!mural) {
		pushFlash(c, 'error', 'Mural not found.');
		return c.redirect('/murals');
	}

	if (!currentUser || String(mural.author) !== String(currentUser._id)) {
		pushFlash(c, 'error', 'You can only edit murals you created.');
		return c.redirect(`/murals/${id}`);
	}

	const body = await parseMultipartBody(c);
	const parsed = muralInputSchema.safeParse({
		title: getStringField(body.title),
		artist: getStringField(body.artist),
		location: getStringField(body.location),
		description: getStringField(body.description),
	});

	if (!parsed.success) {
		pushFlash(c, 'error', parsed.error.issues[0]?.message ?? 'Could not update mural.');
		return c.redirect(`/murals/${id}/edit`);
	}

	const files = extractFilesFromBody(body, 'image');
	const newImages = await uploadImages(files);
	const deleteImages = getStringArray(body.deleteImages);

	if (deleteImages.length) {
		mural.images = mural.images.filter((image) => !deleteImages.includes(image.filename));
		await Promise.all(deleteImages.map((filename) => deleteImage(filename)));
	}

	mural.title = parsed.data.title;
	mural.artist = parsed.data.artist;
	mural.location = parsed.data.location;
	mural.description = parsed.data.description;
	if (newImages.length) {
		mural.images.push(...newImages);
	}

	await mural.save();

	pushFlash(c, 'success', 'Mural updated successfully.');
	return c.redirect(`/murals/${id}`);
});

muralRoutes.post('/murals/:id/delete', requireAuth, async (c) => {
	const id = c.req.param('id');
	if (!isValidObjectId(id)) {
		pushFlash(c, 'error', 'Invalid mural id.');
		return c.redirect('/murals');
	}

	const mural = await Mural.findById(id);
	const currentUser = c.get('currentUser');

	if (!mural) {
		pushFlash(c, 'error', 'Mural not found.');
		return c.redirect('/murals');
	}

	if (!currentUser || String(mural.author) !== String(currentUser._id)) {
		pushFlash(c, 'error', 'You can only delete your own murals.');
		return c.redirect(`/murals/${id}`);
	}

	await Promise.all(mural.images.map((image) => deleteImage(image.filename)));
	await Mural.findByIdAndDelete(id);

	pushFlash(c, 'success', 'Mural deleted.');
	return c.redirect('/murals');
});

muralRoutes.post('/murals/:id/reviews', requireAuth, async (c) => {
	const id = c.req.param('id');
	if (!isValidObjectId(id)) {
		pushFlash(c, 'error', 'Invalid mural id.');
		return c.redirect('/murals');
	}

	const mural = await Mural.findById(id);
	const currentUser = c.get('currentUser');

	if (!mural || !currentUser) {
		pushFlash(c, 'error', 'Unable to create review for this mural.');
		return c.redirect('/murals');
	}

	const body = await c.req.parseBody();
	const parsed = reviewInputSchema.safeParse({
		body: getStringField(body.body),
		rating: getStringField(body.rating),
	});

	if (!parsed.success) {
		pushFlash(c, 'error', parsed.error.issues[0]?.message ?? 'Invalid review.');
		return c.redirect(`/murals/${id}`);
	}

	const review = await Review.create({
		...parsed.data,
		author: currentUser._id,
	});

	mural.reviews.push(review._id);
	await mural.save();

	pushFlash(c, 'success', 'Review added.');
	return c.redirect(`/murals/${id}`);
});

muralRoutes.post('/murals/:id/reviews/:reviewId/delete', requireAuth, async (c) => {
	const muralId = c.req.param('id');
	const reviewId = c.req.param('reviewId');
	const currentUser = c.get('currentUser');

	if (!isValidObjectId(muralId) || !isValidObjectId(reviewId) || !currentUser) {
		pushFlash(c, 'error', 'Invalid review request.');
		return c.redirect('/murals');
	}

	const review = await Review.findById(reviewId);
	if (!review) {
		pushFlash(c, 'error', 'Review not found.');
		return c.redirect(`/murals/${muralId}`);
	}

	if (String(review.author) !== String(currentUser._id)) {
		pushFlash(c, 'error', 'You can only delete your own reviews.');
		return c.redirect(`/murals/${muralId}`);
	}

	await Review.findByIdAndDelete(reviewId);
	await Mural.findByIdAndUpdate(muralId, { $pull: { reviews: reviewId } });

	pushFlash(c, 'success', 'Review deleted.');
	return c.redirect(`/murals/${muralId}`);
});
