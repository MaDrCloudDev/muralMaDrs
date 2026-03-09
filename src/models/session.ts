import { model, Schema, type HydratedDocument, type Types } from 'mongoose';

export interface SessionAttrs {
	tokenHash: string;
	user: Types.ObjectId;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

export type SessionDocument = HydratedDocument<SessionAttrs>;

const sessionSchema = new Schema<SessionAttrs>(
	{
		tokenHash: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = model<SessionAttrs>('Session', sessionSchema);
