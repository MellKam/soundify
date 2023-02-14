export interface SpotifyRawError {
	error: { message: string; status: number };
}

export interface ISpoitfyError extends Error {
	readonly status: number;
	readonly message: string;
}

export class SpotifyError extends Error implements ISpoitfyError {
	public readonly status: number;

	constructor(message: string, status: number) {
		super(message);
		this.status = status;
	}
}
