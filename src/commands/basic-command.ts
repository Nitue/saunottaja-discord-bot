import Command from "./command";
import {Message} from "discord.js";
import CommandInput from "./commandinput/command-input";

export default abstract class BasicCommand implements Command {
    abstract execute(input: CommandInput): Promise<any>;
    abstract getHelp(): [string, string];
    abstract getKeyword(): string;

    supports(message: Message): boolean {
        const args = message.content.split(' ');
        return args.includes(this.getKeyword());
    }

}
