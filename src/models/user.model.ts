export interface UserModel {
	id?: number;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	subscription?: string;
	subscriptionExpiresAt?: string;
	isHelpEnabled?: boolean;
	captchaToken?: string;
}
