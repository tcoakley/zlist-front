export interface UserModel {
	id?: number;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	subscription?: string;
	subscriptionExpiresAt?: string;
	subscriptionSource?: string;
	isPremium?: boolean;
	isAdmin?: boolean;
	isHelpEnabled?: boolean;
	sortCompletedToBottom?: boolean;
	captchaToken?: string;
}
