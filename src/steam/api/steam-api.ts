import settings from '../../settings.json';
import axios from "axios";
import {singleton} from "tsyringe";
import ArrayUtils from "../../common/array-utils";
import User from "../../users/user";
import SteamAppUtils from "../steam-app-utils";
import {SteamApiError} from "./steam-api-error";

@singleton()
export default class SteamApi {

    public async getOwnedGames(user: User): Promise<SteamOwnedGames> {
        try {
            console.log(`Fetching owned games for ${user.steamId}...`);
            const apiMethod = 'IPlayerService/GetOwnedGames/v0001/';
            const result = await axios.get<SteamOwnedGamesResponse>(`${settings.steamWeb.apiUrl}/${apiMethod}`, {
                params: {
                    key: process.env.STEAM_WEB_API_KEY,
                    steamid: user.steamId
                }
            });
            return result.data.response;
        } catch (e) {
            throw new SteamApiError(`Failed to get games for ${user.discordUserRef?.username} (steam id maybe wrong or profile is not public)`, e);
        }
    }

    public async getAppDetails(appId: number): Promise<SteamGameDetails> {
        try {
            console.log(`Fetching application details for ${appId}...`);
            const apiMethod = 'appdetails';
            const result = await axios.get<any>(`${settings.steamStore.apiUrl}/${apiMethod}`, {
                params: {
                    appids: appId,
                    lang: "en"
                }
            });
            return (result.data[`${appId}`] as SteamAppDetailsResponse).data;
        } catch (e) {
            throw new SteamApiError("Failed to get application details", e);
        }
    }

    public async getManyAppDetails(appIds: number[]): Promise<SteamGameDetails[]> {
        const gameDetails = await Promise.all(appIds.map(appId => this.getAppDetails(appId)
            .catch(error => {
                console.warn('Failed to get app details:', error.message);
                return SteamAppUtils.getErrorGameDetails(error.originalError.config.params.appids);
            })));
        return gameDetails.filter(details => !!details);
    }

    public async getUsersAppIdLists(users: User[]): Promise<number[][]> {
        const requests = users.map(user => this.getOwnedGames(user)
            .then(ownedGames => ownedGames.games.map(game => game.appid)));
        return await Promise.all(requests);
    }

    public async getMatchingAppIds(users: User[]): Promise<number[]> {
        const userAppIdLists = await this.getUsersAppIdLists(users);
        return ArrayUtils.getMatchingValues(userAppIdLists);
    }
}
