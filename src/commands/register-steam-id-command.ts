import {Message} from "discord.js";
import SteamIdRepository from "../steam/steam-id-repository";
import BasicCommand from "./basic-command";

export default class RegisterSteamIdCommand extends BasicCommand {

    constructor(
        private steamIdRepository: SteamIdRepository
    ) {
        super();
    }

    async execute(message: Message): Promise<any> {
        const steamIdAsInt = message.content.split(' ')
            .filter(arg => !!parseInt(arg))
            .pop();
        if (steamIdAsInt === undefined) {
            return message.channel.send(this.getHelp());
        }
        const discordUserId = message.author.id;
        const steamId = await this.steamIdRepository.getByDiscordUserId(discordUserId);
        steamId.steamId = steamIdAsInt;
        await this.steamIdRepository.save(steamId);
        return message.react('👍');
    }

    getHelp(): [string, string] {
        return ['steamid <sinun-steam-id>', 'Rekisteröi Steam-tunnus botille. Steam ID on numerosarja.'];
    }

    getKeyword(): string {
        return "steamid";
    }
}
