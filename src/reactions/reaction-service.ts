import {inject, singleton} from "tsyringe";
import {Client as DiscordClient, Message, MessageReaction} from "discord.js";
import Reaction from "./reaction";

@singleton()
export default class ReactionService {

    constructor(
        @inject("reactions") private readonly reactions: Reaction[],
        @inject("discordClient") private discordClient: DiscordClient,
    ) {
    }

    public listenReactions(discordMessage: Message) {
        console.log('Listening for reactions...');
        discordMessage.awaitReactions({time: 120000, max: 1}).then(async collected => {
            const messageReaction = collected.first();
            if (messageReaction) {
                const reaction = this.findReaction(messageReaction);
                if (reaction) {
                    const reactionName = reaction.constructor.name;
                    console.log(`Executing reaction: ${reactionName}`);
                    await reaction?.execute(messageReaction);
                    await this.removeUserReactions(messageReaction);
                    console.log(`Reaction execution finished: ${reactionName}`);
                }

                // Start listening for reactions again
                this.listenReactions(discordMessage);
            } else {
                await discordMessage.reactions.removeAll();
                console.log("Stopped listening for reactions");
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
