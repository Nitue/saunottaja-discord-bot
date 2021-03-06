import SteamAppUtils from "../../steam/steam-app-utils";
import SteamApi from "../../steam/api/steam-api";
import SteamGameMessageFormatter from "./steam-game-message-formatter";
import {MessageEmbed} from "discord.js";
import {singleton} from "tsyringe";

@singleton()
export default class LetsPlayRandom {

    constructor(
        private steamApi: SteamApi,
        private steamGameMessageFormatter: SteamGameMessageFormatter
    ) {}

    public async execute(matchingAppIds: number[], categoryIds: number[]): Promise<MessageEmbed | string> {
        const randomGame = await this.getRandomGame(matchingAppIds, categoryIds);
        if (randomGame === undefined) {
            return "Nyt kävi vähän niin, etten löytänyt riittävän nopeasti peliä, joka olisi sopinut hakukriteereihin. Kokeileppa uudelleen...";
        }
        return this.steamGameMessageFormatter.formatSingleGame(randomGame, "Miten olisi vaikkapa...");
    }

    private async getRandomGame(matchingAppIds: number[], categoryIds: number[]): Promise<SteamGameDetails | undefined> {
        let killSwitchCounter = 0;
        while(killSwitchCounter < 10) {
            const randomAppId = SteamAppUtils.getRandom(matchingAppIds);
            const game = await this.steamApi.getAppDetails(randomAppId);
            if (!game || !SteamAppUtils.isGameInCategory(game, categoryIds)) {
                killSwitchCounter++;
                continue;
            }
            return game;
        }
        console.log(`Killswitched after ${killSwitchCounter} tries!`);
        return undefined;
    }
}
