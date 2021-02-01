import Command from "./command";
import LetsPlayCommand from "./lets-play-command";
import {Client, Message} from "discord.js";
import HelpCommand from "./help-command";
import SteamApi from "../steam/api/steam-api";
import RegisterSteamIdCommand from "./register-steam-id-command";
import SteamIdRepository from "../steam/steam-id-repository";

export default class CommandService {

    private readonly commands: Command[];
    private readonly defaultCommand: Command;

    constructor(
        private discordClient: Client,
        private steamIdRepository: SteamIdRepository
    ) {
        this.commands = [
            new LetsPlayCommand(discordClient, steamIdRepository, new SteamApi()),
            new RegisterSteamIdCommand(steamIdRepository)
        ];
        this.defaultCommand = new HelpCommand(discordClient, this.commands);
    }

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
