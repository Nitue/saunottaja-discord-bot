import {Message} from "discord.js";

export default class MessagePagingUtils {

    public static async addControls(message: Message) {
        message.react("◀️");
        return message.react("▶️");
    }
}
