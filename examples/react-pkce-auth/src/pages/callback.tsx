import { useHandleCallback } from "../spotify";

export const Page = () => {
	const { status, error } = useHandleCallback();

	if (status === "loading") {
		return <h1>Loading...</h1>;
	}
	if (status === "error") {
		return <h1>{String(error)}</h1>;
	}

	location.replace("/");
	return <h1>Successfully authorized</h1>;
};
