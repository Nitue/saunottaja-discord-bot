import {singleton} from "tsyringe";
import UserRepository from "../../users/user-repository";
import {Message, User as DiscordUser} from "discord.js";
import CommandInput from "./command-input";
import User from "../../users/user";

@singleton()
export default class CommandInputFactory {

    constructor(
        private userRepository: UserRepository
    ) {
    }

    public async create(message: Message): Promise<CommandInput> {
        const discordUsers = this.getDiscordUsers(message);
        const users = await this.userRepository.getUsers(discordUsers);
        const usersWithoutSteamId = this.getDiscordUsersWithoutSteamId(discordUsers, users);

        return new CommandInput(message, users, usersWithoutSteamId);
    }

    private getDiscordUsers(message: Message): DiscordUser[] {
        return message.mentions.users.filter(user => user.id !== message.client.user?.id).array();
    }

    private getDiscordUsersWithoutSteamId(discordUsers: DiscordUser[], users: User[]): DiscordUser[]  {
        const usersWithoutSteamId = users.filter(user => !user.steamId);
        return discordUsers.filter(discordUser => usersWithoutSteamId.find(user => user.discordUserId === discordUser.id))
    }
}