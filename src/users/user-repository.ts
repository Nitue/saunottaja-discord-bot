import {Client, QueryResult} from "pg";
import {inject, singleton} from "tsyringe";
import User from "./user";


@singleton()
export default class UserRepository {

    constructor(
        @inject("pgClient") private pgClient: Client
    ) {}

    public save(user: User): Promise<QueryResult<any>> {
        return this.pgClient.query({
            text: 'INSERT INTO "user" (discord_user_id, steam_id) VALUES ($1, $2) ON CONFLICT (discord_user_id) DO UPDATE SET steam_id = $2',
            values: [user.discordUserId, user.steamId]
        });
    }

    public async getByDiscordUserId(discordUserId: string): Promise<User> {
        console.log(`Getting user for discord id ${discordUserId}...`);
        const result = await this.pgClient.query({
            text: 'SELECT * FROM "user" WHERE discord_user_id = $1',
            values: [discordUserId]
        });
        if (result.rowCount > 0) {
            const data = result.rows.pop();
            return new User(data.discord_user_id, data.steam_id, data.id);
        } else {
            return new User(discordUserId);
        }
    }
}
