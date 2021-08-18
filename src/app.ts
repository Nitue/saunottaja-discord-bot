import {Client as DiscordClient, Message, MessageReaction} from "discord.js";
import migrate from "./db/migration";
import CommandService from "./commands/command-service";
import {Client as PgClient} from "pg";
import {inject, singleton} from "tsyringe";
import ReactionService from "./reactions/reaction-service";
import {ReactionEvent} from "./reactions/reaction-event";
import CommandInputFactory from "./commands/commandinput/command-input-factory";
import CommandUtils from "./commands/command-utils";

@singleton()
export default class App {

    constructor(
        private commandService: CommandService,
        private commandInputService: CommandInputFactory,
        private reactionService: ReactionService,
        @inject("pgClient") private pgClient: PgClient,
        @inject("discordClient") private discordClient: DiscordClient
    ) {}

    public run() {
        this.pgClient.connect()
            .then(() => migrate(this.pgClient))
            .catch(error => {
                console.error('Could not connect to database', error);
                process.exit(-1);
            });

        this.discordClient.on("ready", () => {
            console.log(`Ready as ${this.discordClient.user?.tag}`);
        });
        this.discordClient.on("message", (message) => this.handleMessage(message));
        this.discordClient.on("messageReactionAdd", this.createReactionListener(ReactionEvent.messageReactionAdd));
        this.discordClient.on("messageReactionRemove", this.createReactionListener(ReactionEvent.messageReactionRemove));
        this.discordClient.login(process.env.DISCORD_BOT_TOKEN);
    }

    private async handleMessage(message: Message) {
        const command = this.commandService.findCommand(message);
        if (!command) return;

        const commandName = command.constructor.name;
        console.log(`Executing command: ${commandName}`);

        const commandInput = await this.commandInputService.create(message);
        await command.execute(commandInput);
        console.log(`Command execution finished: ${commandName}`)
    }

    private createReactionListener(reactionEvent: ReactionEvent) {
        return (messageReaction: MessageReaction) => {
            const reaction = this.reactionService.findReaction(messageReaction, reactionEvent);
            if (reaction) {
                const reactionName = reaction.constructor.name;
                console.log(`Executing reaction: ${reactionName}`);
                reaction.execute(messageReaction).then(() => console.log(`Reaction execution finished: ${reactionName}`));
            }
        };
    }
}
