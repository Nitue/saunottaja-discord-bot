import settings from '../../settings.json';
import axios from "axios";

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
}
