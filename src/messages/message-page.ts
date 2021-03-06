import {MessageEmbed} from "discord.js";

export default class MessagePage {
    constructor(
        public discordMessageId: string,
        public pageIndex: number,
        public pageContent: MessageEmbed
    ) {
    }
}
