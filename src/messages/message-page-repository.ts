import {Client, QueryResult} from "pg";
import MessagePage from "./message-page";
import {inject, singleton} from "tsyringe";

@singleton()
export default class MessagePageRepository {
    constructor(
        @inject("pgClient") private pgClient: Client
    ) {}

    public save(messagePage: MessagePage): Promise<QueryResult<any>> {
        return this.pgClient.query({
            text: 'INSERT INTO message_page (discord_message_id, page_index, message_content) VALUES ($1, $2, $3)',
            values: [messagePage.discordMessageId, messagePage.pageIndex, messagePage.pageContent]
        });
    }

    public async getByDiscordMessageIdAndPageIndex(discordMessageId: string, pageIndex: number): Promise<MessagePage | undefined> {
        const result = await this.pgClient.query({
            text: 'SELECT * FROM message_page WHERE discord_message_id = $1 AND page_index = $2',
            values: [discordMessageId, pageIndex]
        });
        if (result.rowCount > 0) {
            const data = result.rows.pop();
            return new MessagePage(data.discord_message_id, data.page_index, data.message_content);
        } else {
            return undefined;
        }
    }
}
