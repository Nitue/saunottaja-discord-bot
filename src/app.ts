import {Client as DiscordClient, Interaction, MessageReaction, PartialMessageReaction} from "discord.js";
import migrate from "./db/migration";
import CommandService from "./commands/command-service";
import {Client as PgClient} from "pg";
import {inject, singleton} from "tsyringe";
import ReactionService from "./reactions/reaction-service";
import {ReactionEvent} from "./reactions/reaction-event";
import Command from "./commands/command";

@singleton()
export default class App {

    constructor(
        private commandService: CommandService,
        private reactionService: ReactionService,
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
        this.discordClient.on("messageReactionAdd", this.createReactionListener(ReactionEvent.messageReactionAdd));
        this.discordClient.on("messageReactionRemove", this.createReactionListener(ReactionEvent.messageReactionRemove));
        this.discordClient.login(process.env.DISCORD_BOT_TOKEN).then(() => console.log("Bot logged in"));
    }

    private async handleInteraction(interaction: Interaction) {
        if (!interaction.isCommand()) {
            return;
        }

        const command = this.commandService.findCommand(interaction);
        if (!command) return;

        const commandName = command.constructor.name;
        console.log(`Executing command: ${commandName}`);

        await command.execute(interaction);
        console.log(`Command execution finished: ${commandName}`)
    }

    private createReactionListener(reactionEvent: ReactionEvent) {
        return (messageReaction: MessageReaction | PartialMessageReaction) => {
            const reaction = this.reactionService.findReaction(messageReaction, reactionEvent);
            if (reaction) {
                const reactionName = reaction.constructor.name;
                console.log(`Executing reaction: ${reactionName}`);
                reaction.execute(messageReaction).then(() => console.log(`Reaction execution finished: ${reactionName}`));
            }
        };
    }
}
