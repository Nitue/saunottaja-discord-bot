import {Message} from "discord.js";
import UserRepository from "../users/user-repository";
import BasicCommand from "./basic-command";
import {singleton} from "tsyringe";
import {locale} from "../locale/locale-utils";
import CommandInput from "./commandinput/command-input";
import CommandUtils from "./command-utils";

@singleton()
export default class RegisterSteamIdCommand extends BasicCommand {

    constructor(
        private steamIdRepository: UserRepository
    ) {
        super();
    }

    async execute(input: CommandInput): Promise<any> {
        const message = input.message;
        const steamIdNumber = this.findSteamId(message);
        if (steamIdNumber === undefined) {
            return message.channel.send(CommandUtils.getCommandHelpAsMessageEmbed(this));
        }
        try {
            await this.persistSteamId(steamIdNumber, message.author.id);
            return message.react('👍');
        } catch (error) {
            console.error(error);
            return message.react('👎');
        }
    }

    getHelp(): [string, string] {
        return [locale.command.steamid.help.command, locale.command.steamid.help.description];
    }

    getKeyword(): string {
        return "steamid";
    }

    private async persistSteamId(steamIdNumber: string, discordUserId: string): Promise<any> {
        const steamId = await this.steamIdRepository.getByDiscordUserId(discordUserId);
        steamId.steamId = steamIdNumber;
        return this.steamIdRepository.save(steamId);
    }

    private findSteamId(message: Message): string | undefined {
        return message.content.split(' ')
            .filter(arg => !!parseInt(arg))
            .pop();
    }
}
