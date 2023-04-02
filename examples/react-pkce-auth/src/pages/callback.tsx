import { PKCEAuthCode } from "@soundify/web-auth";
import { CODE_VERIFIER, handleCallback } from "../spotify";

export const Page = () => {
	try {
		const data = PKCEAuthCode.parseCallbackData(
			new URLSearchParams(location.search),
		);

		if ("error" in data) {
			throw new Error(data.error);
		}

		const code_verifier = localStorage.getItem(CODE_VERIFIER);
		if (!code_verifier) {
			throw new Error("Cannot find code_verifier");
		}

		const { status, error } = handleCallback(data.code, code_verifier);

		if (status === "loading") {
			return <h1>Loading...</h1>;
		}
		if (status === "error") {
			throw new Error(String(error));
		}

		return <h1>Authorized</h1>;
	} catch (error) {
		return <h1>{String(error)}</h1>;
	}
};
