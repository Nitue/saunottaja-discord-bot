import Command from "./command";
import {Message} from "discord.js";
import {inject, singleton} from "tsyringe";

@singleton()
export default class CommandService {

    constructor(
        @inject("commands") private readonly commands: Command[],
        @inject("defaultCommand") private readonly defaultCommand: Command
    ) {}

    public findCommand(message: Message): Command | undefined {
        const supportedCommand = this.commands.find(command => command.supports(message));
        if (!supportedCommand) {
            console.log("Returning default command...")
            return this.defaultCommand;
        }
        return supportedCommand;
    }
}
