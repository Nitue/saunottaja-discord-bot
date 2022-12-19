import {inject, singleton} from "tsyringe";
import {Client as DiscordClient, Message, MessageReaction} from "discord.js";
import Reaction from "./reaction";
import {log} from "../logs/logging";

@singleton()
export default class ReactionService {

    constructor(
        @inject("reactions") private readonly reactions: Reaction[],
        @inject("discordClient") private discordClient: DiscordClient,
    ) {
    }

    public listenReactions(discordMessage: Message) {
        log.info('Listening for reactions...');
        discordMessage.awaitReactions({time: 120000, max: 1}).then(async collected => {
            const messageReaction = collected.first();
            if (messageReaction) {
                const reaction = this.findReaction(messageReaction);
                if (reaction) {
                    const reactionName = reaction.constructor.name;
                    log.info(`Executing reaction: ${reactionName}`);
                    await reaction?.execute(messageReaction);
                    await this.removeUserReactions(messageReaction);
                    log.info(`Reaction execution finished: ${reactionName}`);
                }

                // Start listening for reactions again
                this.listenReactions(discordMessage);
            } else {
                await discordMessage.reactions.removeAll();
                log.info("Stopped listening for reactions");
            }
        });
    }

    private removeUserReactions(messageReaction: MessageReaction) {
        const removeReactions = messageReaction.users.cache
            .filter(user => user.id !== this.discordClient?.user?.id)
            .map((user) => messageReaction.users.remove(user));
        return Promise.all(removeReactions);
    }

    private findReaction(messageReaction: MessageReaction): Reaction | undefined {
        return this.reactions.find(reaction => reaction.supports(messageReaction));
    }
}
