import Command from "./command";
import {Client, Message} from "discord.js";
import BasicCommand from "./basic-command";

export default class HelpCommand extends BasicCommand {

    constructor(
        private client: Client,
        private commands: Command[]
    ) {
        super();
    }

    execute(message: Message): Promise<any> {
        return message.channel.send(this.getHelp())
    }

    getHelp(): string {
        const helps = this.commands.map(command => command.getHelp());
        return `Käytössä olevat kommennot ovat: \n${helps.join('\n')}`;
    }

    getKeyword(): string {
        return "help";
    }
}
