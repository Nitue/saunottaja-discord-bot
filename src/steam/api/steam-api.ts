import settings from '../../settings.json';
import axios from "axios";

export default class SteamApi {

    public getOwnedGames(steamId: string): Promise<SteamOwnedGames> {
        console.log(`Fetching owned games for ${steamId}...`);
        const apiMethod = 'IPlayerService/GetOwnedGames/v0001/';
        return axios.get<SteamOwnedGamesResponse>(`${settings.steamWeb.apiUrl}/${apiMethod}`, {
            params: {
                key: process.env.STEAM_WEB_API_KEY,
                steamid: steamId
            }
        }).then(result => result.data.response);
    }

    public getAppDetails(appId: number): Promise<SteamGameDetails> {
        console.log(`Fetching application details for ${appId}...`);
        const apiMethod = 'appdetails';
        return axios.get<any>(`${settings.steamStore.apiUrl}/${apiMethod}`, {
            params: {
                appids: appId
            }
        }).then(result => {
            const response = result.data[`${appId}`] as SteamAppDetailsResponse
            return response.data;
        });
    }
}
