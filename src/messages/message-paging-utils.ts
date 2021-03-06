import {Message} from "discord.js";

export default class MessagePagingUtils {

    public static async addControls(message: Message) {
        await message.react("◀️");
        await message.react("▶️");
    }
}
