<img width="360" alt="Soundify example banner" src="https://user-images.githubusercontent.com/51422045/221211970-06ef3ffc-20b2-4bfb-a468-92e92a84ed22.png">

# Soundify exapmle (deno-oak-auth)

This example uses [OAK](https://github.com/oakserver/oak) (deno http framework)
to show how to make simple http server with Spotify authorization.

> You can use this example as a tool to get your `access_token` and
> `refresh_token` to access the Spotify API.

In this example we will use _Auth Code Flow_ for authorization.
[You can read about it here](https://developer.spotify.com/documentation/general/guides/authorization/code-flow/)

Don't forget to fill in the env variables in the `.env` file in the same way as
in the `.env.example` file.
