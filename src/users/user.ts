import {User as DiscordUser} from "discord.js";

export default class User {

    public discordUserRef?: DiscordUser;

    constructor(
        public discordUserId: string,
        public steamId?: string,
        public id?: number
    ) {}
}
