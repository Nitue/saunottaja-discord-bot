import Command from "./command";
import {MessageEmbed} from "discord.js";
import BasicCommand from "./basic-command";
import CommandUtils from "./command-utils";
import {inject, singleton} from "tsyringe";
import {locale} from "../locale/locale-utils";
import CommandInput from "./commandinput/command-input";

@singleton()
export default class HelpCommand extends BasicCommand {

    constructor(
        @inject("commands") private commands: Command[]
    ) {
        super();
    }

    execute(input: CommandInput): Promise<any> {
        const helps = this.commands.map(command => CommandUtils.getCommandHelpAsEmbedField(command))
        return input.message.channel.send(new MessageEmbed()
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
