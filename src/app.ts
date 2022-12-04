import {Client as DiscordClient, Interaction} from "discord.js";
import migrate from "./db/migration";
import CommandService from "./commands/command-service";
import {Client as PgClient} from "pg";
import {inject, singleton} from "tsyringe";
import Command from "./commands/command";
import {locale, LocaleUtils} from "./locale/locale-utils";

@singleton()
export default class App {

    constructor(
        private commandService: CommandService,
        @inject("pgClient") private pgClient: PgClient,
        @inject("discordClient") private discordClient: DiscordClient,
        @inject("commands") private readonly commands: Command[]
    ) {}

    public async run() {
        this.pgClient.connect()
            .then(() => migrate(this.pgClient))
            .catch(error => {
                console.error('Could not connect to database', error);
                process.exit(-1);
            });

        await this.commandService.registerCommands(this.commands);

        this.discordClient.on("ready", () => {
            console.log(`Ready as ${this.discordClient.user?.tag}`);
        });
        this.discordClient.on("interactionCreate", (interaction) => this.handleInteraction(interaction));
        this.discordClient.login(process.env.DISCORD_BOT_TOKEN).then(() => console.log("Bot logged in"));
    }

    private async handleInteraction(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const command = this.commandService.findCommand(interaction);
        if (!command) return;

        const commandName = command.constructor.name;
        console.log(`Executing command: ${commandName}`);

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.editReply(LocaleUtils.process(locale.generic.command_failed, [(error as any).message]));
        }
        console.log(`Command execution finished: ${commandName}`);
    }
}
