import {Message} from "discord.js";

export default interface Command {
    execute(message: Message): Promise<any>;
    supports(message: Message): boolean;
    getHelp(): string;
    getKeyword(): string;
}
