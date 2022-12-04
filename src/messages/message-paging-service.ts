import {EmbedBuilder, Message, MessageReaction} from "discord.js";
import MessagePageRepository from "./message-page-repository";
import MessagePage from "./message-page";
import {singleton} from "tsyringe";
import MessagePagePositionRepository from "./message-page-position-repository";
import MessagePagePosition from "./message-page-position";

@singleton()
export default class MessagePagingService {

    constructor(
        private messagePageRepository: MessagePageRepository,
        private messagePagePositionRepository: MessagePagePositionRepository
    ) {
    }

    public async addPaging(discordMessage: Message, messages: EmbedBuilder[]): Promise<any> {
        await this.messagePagePositionRepository.save(new MessagePagePosition(discordMessage.id, 0));
        return Promise.all(messages
            .map((message, index) => new MessagePage(discordMessage.id, index, message))
            .map(page => this.messagePageRepository.save(page)));
    }

    public async moveToPage(messageReaction: MessageReaction, moveDirection: 1 | -1): Promise<Message | undefined> {
        const discordMessageId = messageReaction.message.id;
        const messagePagePosition = await this.messagePagePositionRepository.getCurrentPagePositionOfDiscordMessage(discordMessageId);

        // Not a paged message, stop execution
        if (!messagePagePosition) {
            console.log('Message is not paged');
            return undefined;
        }
        const nextIndex = messagePagePosition.currentPageIndex += moveDirection;
        const messagePage = await this.messagePageRepository.getByDiscordMessageIdAndPageIndex(discordMessageId, nextIndex);

        // Requested page does not exist, stop execution
        if (!messagePage) {
            console.log('Requested page did not exist');
            return undefined;
        }

        // Update current index and edit message
        await this.messagePagePositionRepository.save(messagePagePosition);
        const message = await messageReaction.message.edit({
            embeds: [messagePage.pageContent]
        });
        console.log('Page loaded');
        return message;
    }
}
