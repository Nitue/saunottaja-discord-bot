import Command from "./command";
import {Client, Message} from "discord.js";
import SteamIdRepository from "../steam/steam-id-repository";

export default class CommandService {

    constructor(
        private readonly commands: Command[],
        private readonly defaultCommand: Command,
        private discordClient: Client,
        private steamIdRepository: SteamIdRepository
    ) {}

    public findCommand(message: Message): Command | undefined {
        // Ignore own messages
        const isSelf = message.author.id === this.discordClient.user?.id;
        if (isSelf) {
            return undefined;
        }

        // Bot must be mentioned or DM'd
        const botMentioned = message.mentions.users.find(user => user.id === this.discordClient.user?.id) !== undefined;
        const isDirectMessage = message.channel.type === "dm";
        if (!botMentioned && !isDirectMessage) {
            return undefined;
        }

        console.log('Looking for a command...');
        const supportedCommands = this.commands.filter(command => command.supports(message));
        if (supportedCommands.length === 0) {
            console.log('Command is not supported. Returning default command!');
            return this.defaultCommand;
        }
        console.log('Found a command!');
        return supportedCommands[0];
    }
}
