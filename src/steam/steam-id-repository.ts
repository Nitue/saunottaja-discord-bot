import {Client, QueryResult} from "pg";
import SteamId from "./steam-id";

export default class SteamIdRepository {

    constructor(
        private pgClient: Client
    ) {}

    public save(steamId: SteamId): Promise<QueryResult<any>> {
        return this.pgClient.query({
            text: 'INSERT INTO steam_id (discord_user_id, steam_id) VALUES ($1, $2) ON CONFLICT (discord_user_id) DO UPDATE SET steam_id = $2',
            values: [steamId.discordUserId, steamId.steamId]
        });
    }

    public async getByDiscordUserId(discordUserId: string): Promise<SteamId> {
        console.log(`Getting steamid for discord id ${discordUserId}...`);
        const result = await this.pgClient.query({
            text: 'SELECT * FROM steam_id WHERE discord_user_id = $1',
            values: [discordUserId]
        });
        if (result.rowCount > 0) {
            const data = result.rows.pop();
            return new SteamId(data.discord_user_id, data.steam_id, data.id);
        } else {
            return new SteamId(discordUserId);
        }
    }
}
