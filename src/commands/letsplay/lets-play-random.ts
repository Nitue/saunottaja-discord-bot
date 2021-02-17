import SteamAppUtils from "../../steam/steam-app-utils";
import SteamApi from "../../steam/api/steam-api";

export default class LetsPlayRandom {

    constructor(
        private steamApi: SteamApi
    ) {}

    public async getRandomGame(matchingAppIds: number[], categoryIds: number[]): Promise<SteamGameDetails | undefined> {
        let killSwitchCounter = 0;
        while(killSwitchCounter < 10) {
            const randomAppId = SteamAppUtils.getRandom(matchingAppIds);
            const game = await this.steamApi.getAppDetails(randomAppId);
            if (!SteamAppUtils.isGameInCategory(game, categoryIds)) {
                killSwitchCounter++;
                continue;
            }
            return game;
        }
        return undefined;
    }
}
