import {Client, QueryResult} from "pg";
import {inject, singleton} from "tsyringe";
import MessagePagePosition from "./message-page-position";

@singleton()
export default class MessagePagePositionRepository {
    constructor(
        @inject("pgClient") private pgClient: Client
    ) {}

    public save(messagePagePosition: MessagePagePosition): Promise<QueryResult<any>> {
        return this.pgClient.query({
            text: 'INSERT INTO message_page_position (discord_message_id, current_page_index) VALUES ($1, $2) ON CONFLICT (discord_message_id) DO UPDATE SET current_page_index = $2',
            values: [messagePagePosition.discordMessageId, messagePagePosition.currentPageIndex]
        });
    }

    public async getCurrentPagePositionOfDiscordMessage(discordMessageId: string): Promise<MessagePagePosition | undefined> {
        const result = await this.pgClient.query({
            text: 'SELECT * FROM message_page_position WHERE discord_message_id = $1',
            values: [discordMessageId]
        });
        if (result.rowCount > 0) {
            const data = result.rows.pop();
            return new MessagePagePosition(data.discord_message_id, data.current_page_index);
        } else {
            return undefined;
        }
    }
}
