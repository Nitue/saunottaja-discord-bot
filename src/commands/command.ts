import {SlashCommandBuilder} from "@discordjs/builders";
import {ChatInputCommandInteraction} from "discord.js";

export default interface Command {
    execute(interaction: ChatInputCommandInteraction): Promise<any>;
    getSlashCommand(): SlashCommandBuilder;
}
