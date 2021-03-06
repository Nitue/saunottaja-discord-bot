import Command from "./command";
import {Client, Message} from "discord.js";
import {inject, singleton} from "tsyringe";

@singleton()
export default class CommandService {

    constructor(
        @inject("commands") private readonly commands: Command[],
        @inject("defaultCommand") private readonly defaultCommand: Command,
        @inject("discordClient") private discordClient: Client
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
        const supportedCommand = this.commands.find(command => command.supports(message));
        if (!supportedCommand) {
            console.log('Command is not supported. Returning default command!');
            return this.defaultCommand;
        }
        console.log('Found a command!');
        return supportedCommand;
    }
}
