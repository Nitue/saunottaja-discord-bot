import {EmbedField, MessageEmbed} from "discord.js";
import Command from "./command";

export default class CommandUtils {
    public static getCommandHelpAsEmbedField(command: Command): EmbedField {
        const [helpCommand, helpDescription] = command.getHelp();
        return {
            name: `\`${helpCommand}\``,
            value: helpDescription,
            inline: false
        };
    }

    public static getCommandHelpAsMessageEmbed(command: Command): MessageEmbed {
        return new MessageEmbed().addFields(this.getCommandHelpAsEmbedField(command));
    }
}
