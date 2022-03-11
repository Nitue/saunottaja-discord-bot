import {CommandInteraction} from "discord.js";
import UserRepository from "../users/user-repository";
import {singleton} from "tsyringe";
import {locale} from "../locale/locale-utils";
import Command from "./command";
import {SlashCommandBuilder} from "@discordjs/builders";
import SteamApi from "../steam/api/steam-api";

@singleton()
export default class RegisterSteamIdCommand implements Command {

    private ARG_ID = "id";

    constructor(
        private steamApi: SteamApi,
        private steamIdRepository: UserRepository
    ) {}

    async execute(interaction: CommandInteraction): Promise<any> {
        const steamIdOrVanityUrl = interaction.options.getString(this.ARG_ID, true);
        try {
            const steamId = await this.getAsSteamId(steamIdOrVanityUrl);
            if (!steamId) {
                return interaction.reply({content: locale.command.steamid.reply.invalid, ephemeral: true});
            }
            await this.persistSteamId(steamId, interaction.user.id);
            return interaction.reply({content: locale.command.steamid.reply.done, ephemeral: true});
        } catch (error) {
            console.error(error);
            return interaction.reply({content: locale.generic.generic_error, ephemeral: true});
        }
    }

    getSlashCommand(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName("steamid")
            .addStringOption(option => option.setName(this.ARG_ID).setDescription(locale.command.steamid.args.id).setRequired(true))
            .setDescription(locale.command.steamid.description);
    }

    private async getAsSteamId(steamIdOrVanityUrl: string): Promise<string | null> {
        if (this.isProbablySteamId(steamIdOrVanityUrl)) {
            if (await this.steamApi.validateSteamId(steamIdOrVanityUrl)) {
                return steamIdOrVanityUrl;
            }
            return this.steamApi.resolveSteamId(steamIdOrVanityUrl);
        }
        const steamId = this.steamApi.resolveSteamId(steamIdOrVanityUrl);
        if (!steamId) {
            return await this.steamApi.validateSteamId(steamIdOrVanityUrl) ? steamIdOrVanityUrl : null;
        }
        return steamId;
    }

    private isProbablySteamId(steamIdOrVanityUrl: string): boolean {
        return steamIdOrVanityUrl.search(/[^0-9]/) !== -1;
    }

    private async persistSteamId(steamIdNumber: string, discordUserId: string): Promise<any> {
        const steamId = await this.steamIdRepository.getByDiscordUserId(discordUserId);
        steamId.steamId = String(steamIdNumber);
        return this.steamIdRepository.save(steamId);
    }
}
