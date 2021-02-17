type SteamGameDetails = {
    name: string,
    steam_appid: number,
    categories: SteamGameCategory[],
    genres: SteamGameGenre[],
    short_description: string,
    header_image: string
}
