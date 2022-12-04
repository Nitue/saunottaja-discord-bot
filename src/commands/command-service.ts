import Command from "./command";
import {ChatInputCommandInteraction, Collection} from "discord.js";
import {inject, singleton} from "tsyringe";

import {REST} from "@discordjs/rest";
import {Routes} from "discord-api-types/v9";

@singleton()
export default class CommandService {

    private commands = new Collection<string, Command>();

    constructor(
        @inject("discordRest") private readonly discordRestApi: REST
    ) {}

    public findCommand(interaction: ChatInputCommandInteraction): Command | undefined {
        return this.commands.get(interaction.commandName);
    }

    public async registerCommands(commands: Command[]) {
        console.log("Started registering slash commands...");
        const commandDatas = commands.map(command => {
            const data = command.getSlashCommand().toJSON();
            this.commands.set(data.name, command);
            return data;
        });
        await this.discordRestApi.put(Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID as string), {body: commandDatas});
        console.log("Registered slash commands successfully!");
    }
}
