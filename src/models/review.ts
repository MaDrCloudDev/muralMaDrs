import { model, Schema, type HydratedDocument, type Types } from 'mongoose';

export interface ReviewAttrs {
	body: string;
	rating: number;
	author: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

export type ReviewDocument = HydratedDocument<ReviewAttrs>;

const reviewSchema = new Schema<ReviewAttrs>(
	{
		body: {
			type: String,
			required: true,
			trim: true,
			maxlength: 1500,
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

export const Review = model<ReviewAttrs>('Review', reviewSchema);
