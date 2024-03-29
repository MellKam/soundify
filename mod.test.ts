import { assertEquals } from "std/assert/mod.ts";

Deno.test("test endpoint exports", async () => {
	const mod = await import("./mod.ts");
	assertEquals(
		new Set(Object.keys(mod)),
		new Set([
			...EXPECTED_ENDPOINTS_MODULE_EXPORTS,
			...EXPECTED_CLIENT_MODULE_EXPORTS,
		]),
	);
});

const EXPECTED_ENDPOINTS_MODULE_EXPORTS = [
	// user
	"getCurrentUser",
	"getUserTopItems",
	"getUserTopArtists",
	"getUserTopTracks",
	"getUser",
	"followPlaylist",
	"unfollowPlaylist",
	"getFollowedArtists",
	"followArtists",
	"followArtist",
	"followUsers",
	"followUser",
	"unfollowArtists",
	"unfollowArtist",
	"unfollowUsers",
	"unfollowUser",
	"checkIfUserFollowsArtists",
	"checkIfUserFollowsArtist",
	"checkIfUserFollowsUsers",
	"checkIfUserFollowsUser",
	"checkIfUsersFollowPlaylist",
	"checkIfUserFollowsPlaylist",
	// track
	"getTrack",
	"getTracks",
	"getSavedTracks",
	"saveTracks",
	"saveTrack",
	"removeSavedTracks",
	"removeSavedTrack",
	"checkIfTracksSaved",
	"checkIfTrackSaved",
	"getTracksAudioFeatures",
	"getTrackAudioFeatures",
	"getTracksAudioAnalysis",
	"getRecommendations",
	// show
	"getShow",
	"getShows",
	"getShowEpisodes",
	"getSavedShows",
	"saveShows",
	"saveShow",
	"removeSavedShows",
	"removeSavedShow",
	"checkIfShowsSaved",
	"checkIfShowSaved",
	// search
	"search",
	// playlist
	"getPlaylist",
	"changePlaylistDetails",
	"getPlaylistTracks",
	"addItemsToPlaylist",
	"addItemToPlaylist",
	"reorderPlaylistItems",
	"replacePlaylistItems",
	"removePlaylistItems",
	"removePlaylistItem",
	"getCurrentUsersPlaylists",
	"getUsersPlaylists",
	"createPlaylist",
	"getFeaturedPlaylists",
	"getCategoryPlaylists",
	"getPlaylistCoverImage",
	"uploadPlaylistCoverImage",
	// player
	"getPlaybackState",
	"transferPlayback",
	"getAvailableDevices",
	"getCurrentPlayingTrack",
	"startPlayback",
	"resumePlayback",
	"pausePlayback",
	"skipToNext",
	"skipToPrevious",
	"seekToPosition",
	"setRepeatMode",
	"togglePlaybackShuffle",
	"getRecentPlayedTracks",
	"getUserQueue",
	"addItemToPlaybackQueue",
	// market
	"getAvailableMarkets",
	// genre
	"getAvailableGenreSeeds",
	// episode
	"getEpisode",
	"getEpisodes",
	"getSavedEpisodes",
	"saveEpisodes",
	"saveEpisode",
	"removeSavedEpisodes",
	"removeSavedEpisode",
	"checkIfEpisodesSaved",
	"checkIfEpisodeSaved",
	// chapter
	"getChapter",
	"getChapters",
	// category
	"getBrowseCategories",
	"getBrowseCategory",
	// audiobook
	"getAudiobook",
	"getAudiobooks",
	"getAudiobookChapters",
	"getSavedAudiobooks",
	"saveAudiobooks",
	"saveAudiobook",
	"removeSavedAudiobooks",
	"removeSavedAudiobook",
	"checkIfAudiobooksSaved",
	"checkIfAudiobookSaved",
	// artist
	"getArtist",
	"getArtists",
	"getArtistAlbums",
	"getArtistTopTracks",
	"getArtistRelatedArtists",
	// album
	"getAlbum",
	"getAlbums",
	"getAlbumTracks",
	"getSavedAlbums",
	"saveAlbums",
	"saveAlbum",
	"removeSavedAlbums",
	"removeSavedAlbum",
	"checkIfAlbumsSaved",
	"checkIfAlbumSaved",
	"getNewReleases",
];

const EXPECTED_CLIENT_MODULE_EXPORTS = ["SpotifyClient", "SpotifyError"];
