export interface UserModel {
	id?: number;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	subscription?: string;
	subscriptionExpiresAt?: string;
	subscriptionSource?: string;
	isAdmin?: boolean;
	isHelpEnabled?: boolean;
	sortCompletedToBottom?: boolean;
	captchaToken?: string;
}
