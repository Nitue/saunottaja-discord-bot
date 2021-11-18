import {locale} from "../locale/locale-utils";
import UserRepository from "../users/user-repository";
import SteamApi from "../steam/api/steam-api";
import ArrayUtils from "../common/array-utils";
import _ from "lodash";
import SteamGameMessageFormatter from "../steam/steam-game-message-formatter";
import MessagePagingUtils from "../messages/message-paging-utils";
import MessagePagingService from "../messages/message-paging-service";
import {singleton} from "tsyringe";
import SteamAppUtils from "../steam/steam-app-utils";
import Command from "./command";
import {CommandInteraction, Message, MessagePayload} from "discord.js";
import {SlashCommandBuilder} from "@discordjs/builders";
import CategoryUtils from "../common/category-utils";
import InteractionUtils from "../common/interaction-utils";

@singleton()
export default class LetsBuyCommand implements Command{

    private ARG_CATEGORY = "category";
    private ARG_USER1 = "user1";
    private ARG_USER2 = "user2";
    private ARG_USER3 = "user3";
    private ARG_USER4 = "user4";
    private ARG_USERS = [this.ARG_USER1, this.ARG_USER2, this.ARG_USER3, this.ARG_USER4];

    constructor(
        private userRepository: UserRepository,
        private steamApi: SteamApi,
        private messagePagingService: MessagePagingService,
        private steamGameMessageFormatter: SteamGameMessageFormatter
    ) {}

    async execute(interaction: CommandInteraction): Promise<any> {
        const message = await interaction.deferReply({fetchReply: true}) as Message;
        const discordUsers = InteractionUtils.getDiscordUsers(interaction, this.ARG_USERS);
        const users = await this.userRepository.getUsers(discordUsers);

        const usersAppIdLists = await this.steamApi.getUsersAppIdLists(users);
        const appIdOccurrences = ArrayUtils.getOccurrences(usersAppIdLists);
        const requiredOccurrences = users.length - 1;
        const appIds = _.keys(_.pickBy(appIdOccurrences, occurrenceCount => occurrenceCount >= requiredOccurrences && occurrenceCount < users.length))
            .map(appId => Number(appId));
        const allGames = await this.steamApi.getManyAppDetails(appIds);
        const categoryIds = CategoryUtils.getCategoryIds(interaction.options.getString(this.ARG_CATEGORY));
        const games = allGames.filter(game => SteamAppUtils.isGameInCategory(game, categoryIds));

        const messages = this.steamGameMessageFormatter.formatAsMessageEmbeds(games, locale.command.letsbuy.reply.buy_these);

        // Reply
        return interaction.editReply(MessagePayload.create(interaction, {embeds: [messages[0]]})).then(async (sentMessage) => {
            await this.messagePagingService.addPaging(sentMessage.id, messages);
            return MessagePagingUtils.addControls(message);
        });
    }

    getSlashCommand(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName("letsbuy")
            .addUserOption(option => option.setName(this.ARG_USER1).setDescription(locale.command.letsbuy.args.user).setRequired(true))
            .addUserOption(option => option.setName(this.ARG_USER2).setDescription(locale.command.letsbuy.args.user).setRequired(true))
            .addUserOption(option => option.setName(this.ARG_USER3).setDescription(locale.command.letsbuy.args.user))
            .addUserOption(option => option.setName(this.ARG_USER4).setDescription(locale.command.letsbuy.args.user))
            .addStringOption(option => option
                .setName(this.ARG_CATEGORY)
                .setDescription(locale.command.letsbuy.args.category)
                .addChoice("All", "default")
                .addChoice("Co-Op", "coop")
                .addChoice("MMO", "mmo"))
            .setDescription(locale.command.letsbuy.description);
    }

}