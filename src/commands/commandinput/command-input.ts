import {Message, User as DiscordUser} from "discord.js";
import User from "../../users/user";

export default class CommandInput {

    constructor(
        public readonly message: Message,
        public readonly users: User[],
        public readonly usersWithoutSteamId: DiscordUser[]
    ) {
    }
}