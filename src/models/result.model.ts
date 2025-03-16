export interface Result<T> {
	success: boolean;
	message: string;
	model: T;
}
