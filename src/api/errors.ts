export interface SpoitfyErrorInterface extends Error {
	readonly status: number;
	readonly message: string;
}

export class SpotifyError extends Error implements SpoitfyErrorInterface {
	public readonly status: number;

	constructor(message: string, status: number) {
		super(message);
		this.status = status;
	}
}

export class AuthError extends SpotifyError {
	constructor(message: string) {
		super(message, 401);
	}
}

export class ForbiddenError extends SpotifyError {
	constructor(message: string) {
		super(message, 403);
	}
}

export class NotFoundError extends SpotifyError {
	constructor(message: string) {
		super(message, 404);
	}
}

export class RatelimitError extends SpotifyError {
	constructor(message: string) {
		super(message, 404);
	}
}

export class BadRequestError extends SpotifyError {
	constructor(message: string) {
		super(message, 400);
	}
}
