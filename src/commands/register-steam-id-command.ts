import {Message, MessageEmbed} from "discord.js";
import UserRepository from "../users/user-repository";
import BasicCommand from "./basic-command";
import CommandUtils from "./command-utils";
import {singleton} from "tsyringe";

@singleton()
export default class RegisterSteamIdCommand extends BasicCommand {

    constructor(
        private steamIdRepository: UserRepository
    ) {
        super();
    }

    async execute(message: Message): Promise<any> {
        const steamIdNumber = this.findSteamId(message);
        if (steamIdNumber === undefined) {
            return message.channel.send(new MessageEmbed().addFields(CommandUtils.getCommandHelpAsEmbedField(this)));
        }
        try {
            await this.persistSteamId(steamIdNumber, message.author.id);
            return message.react('👍');
        } catch (error) {
            return message.channel.send('Nyt meni jotain vikaan...!');
        }
    }

    getHelp(): [string, string] {
        return ['steamid <sinun-steam-id>', 'Rekisteröi Steam-tunnus botille. Steam ID on numerosarja.'];
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
