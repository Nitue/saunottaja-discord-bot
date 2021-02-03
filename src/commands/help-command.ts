import Command from "./command";
import {Client, Message, MessageEmbed} from "discord.js";
import BasicCommand from "./basic-command";
import CommandUtils from "./command-utils";

export default class HelpCommand extends BasicCommand {

    constructor(
        private client: Client,
        private commands: Command[]
    ) {
        super();
    }

    execute(message: Message): Promise<any> {
        const helps = this.commands.map(command => CommandUtils.getCommandHelpAsEmbedField(command))
        return message.channel.send(new MessageEmbed()
            .setTitle('Ohjeet')
            .setDescription('Viestissä pitää mainita minut, ellet lähetä yksityisviestiä. Kaikki toiminnot, joissa pitää mainita muu käyttäjä eivät toimi yksityisviestitse!')
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
