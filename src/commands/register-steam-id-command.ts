import {Message} from "discord.js";
import SteamIdRepository from "../steam/steam-id-repository";
import SteamId from "../steam/steam-id";
import BasicCommand from "./basic-command";

export default class RegisterSteamIdCommand extends BasicCommand {

    constructor(
        private steamIdRepository: SteamIdRepository
    ) {
        super();
    }

    execute(message: Message): Promise<any> {
        const steamIdAsInt = message.content.split(' ')
            .filter(arg => !!parseInt(arg))
            .pop();
        if (steamIdAsInt === undefined) {
            return message.channel.send(this.getHelp());
        }
        const discordUserId = message.author.id;
        return this.steamIdRepository.getByDiscordUserId(discordUserId).then(steamId => {
            steamId.steamId = steamIdAsInt;
            return this.steamIdRepository.save(steamId);
        }).then(result => {
            return message.react('👍');
        })
    }

    getHelp(): string {
        return `\`steamid <sinun-steam-id>\` rekisteröi Steam-tunnuksesi botille. Steam ID on numerosarja.`;
    }

    getKeyword(): string {
        return "steamid";
    }
}
