import Command from "./command";
import {Collection, CommandInteraction} from "discord.js";
import {inject, singleton} from "tsyringe";
import {REST} from "@discordjs/rest";
import {Routes} from "discord-api-types";

@singleton()
export default class CommandService {

    private commands = new Collection<string, Command>();

    constructor(
        @inject("discordRest") private readonly discordRestApi: REST
    ) {}

    public findCommand(interaction: CommandInteraction): Command | undefined {
        return this.commands.get(interaction.commandName);
    }

    public async registerCommands(commands: Command[]) {
        console.log("Started registering slash commands...");
        const commandDatas = this.commands.map(command => {
            const data = command.getSlashCommand().toJSON();
            this.commands.set(data.name, command);
            return data;
        });
        await this.discordRestApi.put(Routes.applicationCommands(process.env.DISCORD_APP_ID), {body: commandDatas});
        console.log("Registered slash commands successfully!");
    }
}
