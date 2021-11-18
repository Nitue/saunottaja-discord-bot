import {CommandInteraction} from "discord.js";
import UserRepository from "../users/user-repository";
import {singleton} from "tsyringe";
import {locale} from "../locale/locale-utils";
import Command from "./command";
import {SlashCommandBuilder} from "@discordjs/builders";

@singleton()
export default class RegisterSteamIdCommand implements Command {

    private ARG_ID = "id";

    constructor(
        private steamIdRepository: UserRepository
    ) {}

    async execute(interaction: CommandInteraction): Promise<any> {
        const steamId = interaction.options.getString(this.ARG_ID, true);
        try {
            await this.persistSteamId(steamId, interaction.user.id);
            return interaction.reply({content: "Done! You can now use other commands.", ephemeral: true});
        } catch (error) {
            console.error(error);
            return interaction.reply({content: "Something went seriously wrong! Try again, maybe?", ephemeral: true});
        }
    }

    getSlashCommand(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName("steamid")
            .addStringOption(option => option.setName(this.ARG_ID).setDescription(locale.command.steamid.args.id).setRequired(true))
            .setDescription(locale.command.steamid.description);
    }

    private async persistSteamId(steamIdNumber: string, discordUserId: string): Promise<any> {
        const steamId = await this.steamIdRepository.getByDiscordUserId(discordUserId);
        steamId.steamId = String(steamIdNumber);
        return this.steamIdRepository.save(steamId);
    }
}
