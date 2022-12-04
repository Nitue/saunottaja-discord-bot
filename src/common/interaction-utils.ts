import {ChatInputCommandInteraction, EmbedBuilder, Interaction, MessagePayload, User} from "discord.js";
import _ from "lodash";

export default class InteractionUtils {
    public static getDiscordUsers(interaction: ChatInputCommandInteraction, fromArgs?: string[]): User[] {
        let users: User[] = [];
        if (fromArgs) {
            users = fromArgs.map(arg => interaction.options.getUser(arg)).filter(this.isUser);
        }
        users.push(interaction.user);
        return _.uniqBy(users, "id");
    }

    public static editReplyEmbeds(interaction: ChatInputCommandInteraction, embeds: EmbedBuilder[]) {
        return interaction.editReply(MessagePayload.create(interaction as Interaction, {embeds}))
    }

    private static isUser(user: User | null): user is User {
        return !!user;
    }
}