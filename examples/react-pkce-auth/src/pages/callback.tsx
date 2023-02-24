import { getCallbackData, handleCallback } from "../spotify";

export const Page = () => {
	const { code, code_verifier } = getCallbackData();
	if (!code || !code_verifier) {
		return <h1>Cannot get data for authorization (code, code_verifier)</h1>;
	}

	const { status, error } = handleCallback(code, code_verifier);
	if (status === "loading") {
		return <h1>Loading...</h1>;
	}
	if (status === "error") {
		return <h1>{String(error)}</h1>;
	}

	return <h1>Authorized</h1>;
};
