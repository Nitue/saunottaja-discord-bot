import {MessageReaction, PartialMessageReaction} from "discord.js";
import {ReactionEvent} from "./reaction-event";

export default interface Reaction {
    execute(messageReaction: MessageReaction): Promise<any>;
    supports(messageReaction: MessageReaction): boolean;
}
