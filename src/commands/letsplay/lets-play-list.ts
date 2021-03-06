import SteamAppUtils from "../../steam/steam-app-utils";
import SteamApi from "../../steam/api/steam-api";
import SteamGameMessageFormatter from "./steam-game-message-formatter";
import {MessageEmbed} from "discord.js";
import {singleton} from "tsyringe";

@singleton()
export default class LetsPlayList {
    constructor(
        private steamApi: SteamApi,
        private steamGameMessageFormatter: SteamGameMessageFormatter
    ) {}

    public async execute(matchingAppIds: number[], categoryIds: number[]): Promise<MessageEmbed[]> {
        const {games, unknownGames} = await this.getGameList(matchingAppIds, categoryIds);
        const unknownGameMessageEmbeds = this.steamGameMessageFormatter.formatAsUrlList(
            unknownGames,
            "Pelejä, joista ei voitu hakea tietoja",
            "Voisitte pelailla vaikka näitä pelejä",
            "Näistä peleistä ei saatu haettua lisätietoja. Syynä voi olla väliaikaiset verkko-ongelmat. Lista voi sisältää yksinpelejä."
        );
        const gameMessageEmbeds = this.steamGameMessageFormatter.formatAsDetailedFields(games, categoryIds, "Voisitte pelailla vaikka näitä pelejä");
        return gameMessageEmbeds.concat(unknownGameMessageEmbeds);
    }

    public async getGameList(matchingAppIds: number[], categoryIds: number[]): Promise<{games: SteamGameDetails[], unknownGames: SteamGameDetails[]}> {
        // Get details of each app ID from Steam
        const games = await this.getSteamAppDetails(matchingAppIds);

        // Filter games by categories
        const errorGames = games.filter(game => SteamAppUtils.isGameInCategory(game, SteamAppUtils.ERROR_CATEGORY_IDS));
        const gamesToPlay = games.filter(game => SteamAppUtils.isGameInCategory(game, categoryIds));

        return {
            games: gamesToPlay,
            unknownGames: errorGames
        };
    }

    private async getSteamAppDetails(appIds: number[]): Promise<SteamGameDetails[]> {
        const gameDetails = await Promise.all(appIds.map(appId => this.steamApi.getAppDetails(appId)
            .catch(error => {
                console.warn('Failed to get app details:', error.message);
                return SteamAppUtils.getErrorGameDetails(error.config.params.appids);
            })));
        return gameDetails.filter(details => !!details);
    }
}
