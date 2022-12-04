import {EmbedBuilder} from "discord.js";

export default class MessagePage {
    constructor(
        public discordMessageId: string,
        public pageIndex: number,
        public pageContent: EmbedBuilder
    ) {
    }
}
