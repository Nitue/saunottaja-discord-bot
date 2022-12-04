import {locale, LocaleUtils} from "../locale/locale-utils";
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
import {ChatInputCommandInteraction, Message} from "discord.js";
import {SlashCommandBuilder} from "@discordjs/builders";
import CategoryUtils from "../common/category-utils";
import InteractionUtils from "../common/interaction-utils";
import ReactionService from "../reactions/reaction-service";
import UserUtils from "../users/user-utils";

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
        private steamGameMessageFormatter: SteamGameMessageFormatter,
        private reactionService: ReactionService
    ) {}

    async execute(interaction: ChatInputCommandInteraction): Promise<any> {
        const message = await interaction.deferReply({fetchReply: true}) as Message;
        const discordUsers = InteractionUtils.getDiscordUsers(interaction, this.ARG_USERS);
        const users = await this.userRepository.getUsers(discordUsers);
        const usersWithoutSteamId = UserUtils.getUsersWithoutSteamId(discordUsers, users);

        if (usersWithoutSteamId.length > 0) {
            return interaction.editReply(LocaleUtils.process(locale.generic.steam_account_missing, [usersWithoutSteamId.join(", ")]));
        }

        const usersAppIdLists = await this.steamApi.getUsersAppIdLists(users);
        const appIdOccurrences = ArrayUtils.getOccurrences(usersAppIdLists);
        const requiredOccurrences = users.length - 1;
        const appIds = _.keys(_.pickBy(appIdOccurrences, occurrenceCount => occurrenceCount == requiredOccurrences))
            .map(appId => Number(appId));
        const allGames = await this.steamApi.getManyAppDetails(appIds);
        const categoryIds = CategoryUtils.getCategoryIds(interaction.options.getString(this.ARG_CATEGORY));
        const games = allGames.filter(game => SteamAppUtils.isGameInCategory(game, categoryIds));

        const messages = this.steamGameMessageFormatter.formatAsMessageEmbeds(games, locale.command.letsbuy.reply.buy_these);

        // Reply
        return InteractionUtils.editReplyEmbeds(interaction, [messages[0]]).then(async () => {
            await this.messagePagingService.addPaging(message, messages);
            await MessagePagingUtils.addControls(message);
            this.reactionService.listenReactions(message);
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
                .addChoices(...[
                    {name: "All", value: "default"},
                    {name: "Co-Op", value: "coop"},
                    {name: "MMO", value: "mmo"}
                ]))
            .setDescription(locale.command.letsbuy.description);
    }

}