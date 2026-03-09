import { model, Schema, type HydratedDocument, type Types } from 'mongoose';

import { Review } from './review';

export interface MuralImage {
	url: string;
	filename: string;
}

export interface MuralGeometry {
	type: 'Point';
	coordinates: [number, number];
}

export interface MuralAttrs {
	title: string;
	artist: string;
	description: string;
	location: string;
	images: MuralImage[];
	geometry: MuralGeometry;
	author: Types.ObjectId;
	reviews: Types.ObjectId[];
	createdAt: Date;
	updatedAt: Date;
}

export type MuralDocument = HydratedDocument<MuralAttrs>;

const imageSchema = new Schema<MuralImage>(
	{
		url: { type: String, required: true },
		filename: { type: String, required: true },
	},
	{ _id: false }
);

imageSchema.virtual('thumbnail').get(function thumbnail(this: MuralImage) {
	return this.url.includes('/upload/')
		? this.url.replace('/upload/', '/upload/w_640,f_auto,q_auto/')
		: this.url;
});

const muralSchema = new Schema<MuralAttrs>(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			maxlength: 140,
		},
		artist: {
			type: String,
			required: true,
			trim: true,
			maxlength: 120,
		},
		description: {
			type: String,
			required: true,
			trim: true,
			maxlength: 3000,
		},
		location: {
			type: String,
			required: true,
			trim: true,
			maxlength: 180,
		},
		images: {
			type: [imageSchema],
			default: [],
		},
		geometry: {
			type: {
				type: String,
				enum: ['Point'],
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		reviews: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Review',
			},
		],
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

muralSchema.index({ geometry: '2dsphere' });

muralSchema.virtual('popupMarkup').get(function popupMarkup(this: MuralAttrs & { _id: Types.ObjectId }) {
	const shortDescription =
		this.description.length > 90
			? `${this.description.slice(0, 90)}...`
			: this.description;

	return `<strong><a href="/murals/${this._id}">${this.title}</a></strong><p>${shortDescription}</p>`;
});

muralSchema.post('findOneAndDelete', async (doc: MuralDocument | null) => {
	if (!doc?.reviews.length) {
		return;
	}

	await Review.deleteMany({ _id: { $in: doc.reviews } });
});

export const Mural = model<MuralAttrs>('Mural', muralSchema);
