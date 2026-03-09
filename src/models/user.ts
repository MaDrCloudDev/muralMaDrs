import { model, Schema, type HydratedDocument, type Model } from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

export interface UserAttrs {
	email: string;
	username: string;
	createdAt: Date;
	updatedAt: Date;
}

export type UserDocument = HydratedDocument<UserAttrs>;

type AuthenticateCallback = (
	error: unknown,
	user: UserDocument | false | null
) => void;

type UserModel = Model<UserAttrs> & {
	register(user: UserDocument, password: string): Promise<UserDocument>;
	authenticate(): (
		username: string,
		password: string,
		callback: AuthenticateCallback
	) => void;
};

const userSchema = new Schema<UserAttrs>(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

userSchema.plugin(passportLocalMongoose, {
	usernameCaseInsensitive: true,
	limitAttempts: true,
	maxAttempts: 5,
	unlockInterval: 30 * 60 * 1000,
});

export const User = model<UserAttrs, UserModel>('User', userSchema);
