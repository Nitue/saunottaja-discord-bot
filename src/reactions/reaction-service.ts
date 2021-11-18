import {inject, singleton} from "tsyringe";
import {MessageReaction, PartialMessageReaction} from "discord.js";
import Reaction from "./reaction";
import {ReactionEvent} from "./reaction-event";

@singleton()
export default class ReactionService {

    constructor(
        @inject("reactions") private readonly reactions: Reaction[],
    ) {
    }

    public findReaction(messageReaction: MessageReaction | PartialMessageReaction, reactionEvent: ReactionEvent): Reaction | undefined {
        if (messageReaction.me) {
            return undefined;
        }
        return this.reactions.find(reaction => reaction.supports(messageReaction, reactionEvent));
    }
}
