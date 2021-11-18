import Reaction from "./reaction";
import {MessageReaction} from "discord.js";
import {singleton} from "tsyringe";
import MessagePagingService from "../messages/message-paging-service";

@singleton()
export default class NextPageReaction implements Reaction {

    constructor(
        private messagePagingService: MessagePagingService
    ) {}

    execute(messageReaction: MessageReaction): Promise<any> {
        return this.messagePagingService.moveToPage(messageReaction, 1);
    }

    supports(messageReaction: MessageReaction): boolean {
        return messageReaction.emoji.name === "▶️";
    }

}
