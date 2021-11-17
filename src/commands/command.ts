import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";

export default interface Command {
    execute(interaction: CommandInteraction): Promise<any>;
    getSlashCommand(): SlashCommandBuilder;
}
