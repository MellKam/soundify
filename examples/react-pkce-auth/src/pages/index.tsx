import { useQuery } from "@tanstack/react-query";
import { getUserTopItems } from "soundify-web-api/web";
import { useSpotify } from "../spotify";

export const Page = () => {
	const { client } = useSpotify();
	const { status, data: topArtists, error } = useQuery({
		queryKey: ["user-profile"],
		queryFn: () => {
			return getUserTopItems(client, "artists");
		},
		retry: false,
	});

	if (status === "error") {
		return <h1>{String(error)}</h1>;
	}
	if (status === "loading") {
		return <h1>Loading...</h1>;
	}

	return (
		<main>
			<h1>Your top artists</h1>
			<ul
				style={{
					display: "flex",
					flexDirection: "column",
					rowGap: "8px",
					paddingLeft: "0",
				}}
			>
				{topArtists.items.map((artist) => (
					<li
						style={{
							display: "flex",
							alignItems: "center",
							columnGap: "12px",
						}}
						key={artist.id}
					>
						<img
							src={artist.images[0].url}
							height="36px"
							width="36px"
							style={{ borderRadius: "50%" }}
						/>
						<h3 style={{ margin: "0" }}>{artist.name}</h3>
						<p style={{ margin: "0" }}>Popularity: {artist.popularity}</p>
					</li>
				))}
			</ul>
		</main>
	);
};
