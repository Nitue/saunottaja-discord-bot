import settings from '../../settings.json';
import axios from "axios";
import {singleton} from "tsyringe";
import ArrayUtils from "../../common/array-utils";
import User from "../../users/user";

@singleton()
export default class SteamApi {

    public async getOwnedGames(steamId: string): Promise<SteamOwnedGames> {
        console.log(`Fetching owned games for ${steamId}...`);
        const apiMethod = 'IPlayerService/GetOwnedGames/v0001/';
        const result = await axios.get<SteamOwnedGamesResponse>(`${settings.steamWeb.apiUrl}/${apiMethod}`, {
            params: {
                key: process.env.STEAM_WEB_API_KEY,
                steamid: steamId
            }
        });
        return result.data.response;
    }

    public async getAppDetails(appId: number): Promise<SteamGameDetails> {
        console.log(`Fetching application details for ${appId}...`);
        const apiMethod = 'appdetails';
        const result = await axios.get<any>(`${settings.steamStore.apiUrl}/${apiMethod}`, {
            params: {
                appids: appId,
                lang: "en"
            }
        });
        return (result.data[`${appId}`] as SteamAppDetailsResponse).data;
    }

    public async getMatchingAppIds(users: User[]): Promise<number[]> {
        const requests = users.map(user => this.getOwnedGames(user.steamId as string)
            .then(ownedGames => ownedGames.games.map(game => game.appid)));
        const userAppIdLists = await Promise.all(requests);
        return ArrayUtils.getMatchingValues(userAppIdLists);
    }
}
