import type { UserDocument } from './models/user.js';

export interface FlashMessages {
	success: string[];
	error: string[];
}

export interface AppVariables {
	currentUser: UserDocument | null;
}

export type AppBindings = {
	Variables: AppVariables;
};
