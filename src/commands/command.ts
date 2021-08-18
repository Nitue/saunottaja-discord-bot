import {Message} from "discord.js";
import CommandInput from "./commandinput/command-input";

export default interface Command {
    execute(input: CommandInput): Promise<any>;
    supports(message: Message): boolean;
    getHelp(): [string, string];
}
