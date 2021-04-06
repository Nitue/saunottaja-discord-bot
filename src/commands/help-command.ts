import Command from "./command";
import {Message, MessageEmbed} from "discord.js";
import BasicCommand from "./basic-command";
import CommandUtils from "./command-utils";
import {inject, singleton} from "tsyringe";
import {locale} from "../locale/locale-utils";

@singleton()
export default class HelpCommand extends BasicCommand {

    constructor(
        @inject("commands") private commands: Command[]
    ) {
        super();
    }

    execute(message: Message): Promise<any> {
        const helps = this.commands.map(command => CommandUtils.getCommandHelpAsEmbedField(command))
        return message.channel.send(new MessageEmbed()
            .setTitle(locale.command.help.title)
            .setDescription(locale.command.help.description)
            .addFields(helps)
        );
    }

    getHelp(): [string, string] {
        return ['help', 'Esimerkki'];
    }

    getKeyword(): string {
        return "help";
    }
}
