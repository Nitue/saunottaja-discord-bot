import {MessageReaction} from "discord.js";

export default interface Reaction {
    execute(messageReaction: MessageReaction): Promise<any>;
    supports(messageReaction: MessageReaction): boolean;
}
