import {MessageReaction, PartialMessageReaction} from "discord.js";
import {ReactionEvent} from "./reaction-event";

export default interface Reaction {
    execute(messageReaction: MessageReaction | PartialMessageReaction): Promise<any>;
    supports(messageReaction: MessageReaction | PartialMessageReaction, reactionEvent: ReactionEvent): boolean;
}
