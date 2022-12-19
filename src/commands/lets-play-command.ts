import SteamApi from "../steam/api/steam-api";
import UserRepository from "../users/user-repository";
import {locale, LocaleUtils} from "../locale/locale-utils";
import {singleton} from "tsyringe";
import MessagePagingService from "../messages/message-paging-service";
import MessagePagingUtils from "../messages/message-paging-utils";
import SteamAppUtils from "../steam/steam-app-utils";
import SteamGameMessageFormatter from "../steam/steam-game-message-formatter";
import Command from "./command";
import {ChatInputCommandInteraction, Message} from "discord.js";
import {SlashCommandBuilder} from "@discordjs/builders";
import CategoryUtils from "../common/category-utils";
import InteractionUtils from "../common/interaction-utils";
import ReactionService from "../reactions/reaction-service";
import UserUtils from "../users/user-utils";
import {log} from "../logs/logging";

@singleton()
export default class LetsPlayCommand implements Command {

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
            log.warning('One or more players have not registered a Steam ID for the bot: ', usersWithoutSteamId);
            return interaction.editReply(LocaleUtils.process(locale.generic.steam_account_missing, [usersWithoutSteamId.join(", ")]));
        }

        // Get categories from input
        const categoryIds = CategoryUtils.getCategoryIds(interaction.options.getString(this.ARG_CATEGORY));

        // Find out games and their details
        const appIds = await this.steamApi.getMatchingAppIds(users);
        const appDetailList = await this.steamApi.getManyAppDetails(appIds);
        const unknownGames = appDetailList.filter(game => SteamAppUtils.isGameInCategory(game, SteamAppUtils.ERROR_CATEGORY_IDS));
        const games = appDetailList.filter(game => SteamAppUtils.isGameInCategory(game, categoryIds));

        // Input and output to messages
        const categoryNames = categoryIds.map(id => SteamAppUtils.getCategoryName(id)).join(', ');
        const unknownGameMessageEmbeds = this.steamGameMessageFormatter.formatAsUrlList(
            unknownGames,
            locale.command.letsplay.reply.games_without_info,
            locale.command.letsplay.reply.you_could_play_these,
            locale.command.letsplay.reply.games_without_info_detailed
        );
        const gameMessageEmbeds = this.steamGameMessageFormatter.formatAsMessageEmbeds(games, locale.command.letsplay.reply.you_could_play_these, categoryNames);
        const messages = gameMessageEmbeds.concat(unknownGameMessageEmbeds);

        // Reply
        return InteractionUtils.editReplyEmbeds(interaction, [messages[0]]).then(async () => {
            if (messages.length === 1) return;
            await this.messagePagingService.addPaging(message, messages);
            await MessagePagingUtils.addControls(message);
            this.reactionService.listenReactions(message);
        });
    }

    getSlashCommand(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName("letsplay")
            .addUserOption(option => option.setName(this.ARG_USER1).setDescription(locale.command.letsplay.args.user).setRequired(true))
            .addUserOption(option => option.setName(this.ARG_USER2).setDescription(locale.command.letsplay.args.user))
            .addUserOption(option => option.setName(this.ARG_USER3).setDescription(locale.command.letsplay.args.user))
            .addUserOption(option => option.setName(this.ARG_USER4).setDescription(locale.command.letsplay.args.user))
            .addStringOption(option => option
                .setName(this.ARG_CATEGORY)
                .setDescription(locale.command.letsplay.args.category)
                .addChoices(...[
                    {name: "All", value: "default"},
                    {name: "Co-Op", value: "coop"},
                    {name: "MMO", value: "mmo"}
                ]))
            .setDescription(locale.command.letsplay.description);
    }
}
