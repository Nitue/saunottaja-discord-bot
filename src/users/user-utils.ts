import {User as DiscordUser} from "discord.js";
import User from "./user";


export default class UserUtils {
    public static getUsersWithoutSteamId(discordUsers: DiscordUser[], users: User[]): string[] {
        return discordUsers
            .filter(discordUser => !users.find(user => discordUser.id === user.discordUserId && user.steamId && user.steamId.length > 0))
            .map(discordUser => discordUser.username);
    }
}