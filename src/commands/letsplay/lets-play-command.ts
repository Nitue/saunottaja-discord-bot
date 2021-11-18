import SteamApi from "../../steam/api/steam-api";
import UserRepository from "../../users/user-repository";
import LetsPlayUtils from "./lets-play-utils";
import {locale} from "../../locale/locale-utils";
import {singleton} from "tsyringe";
import MessagePagingService from "../../messages/message-paging-service";
import MessagePagingUtils from "../../messages/message-paging-utils";
import SteamAppUtils from "../../steam/steam-app-utils";
import SteamGameMessageFormatter from "../../steam/steam-game-message-formatter";
import Command from "../command";
import {CommandInteraction, Message, MessagePayload, User} from "discord.js";
import {SlashCommandBuilder} from "@discordjs/builders";

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
        private steamGameMessageFormatter: SteamGameMessageFormatter
    ) {}

    async execute(interaction: CommandInteraction): Promise<any> {

        const message = await interaction.deferReply({fetchReply: true}) as Message;
        const discordUsers = this.ARG_USERS.map(arg => interaction.options.getUser(arg)).filter(this.isUser);
        const users = await this.userRepository.getUsers(discordUsers);

        // Get categories from input
        const categoryIds = LetsPlayUtils.getCategoryIds(interaction.options.getString(this.ARG_CATEGORY) as string | undefined);

        // Find out games and their details
        const appIds = await this.steamApi.getMatchingAppIds(users);
        const appDetailList = await this.steamApi.getManyAppDetails(appIds);
        const unknownGames = appDetailList.filter(game => SteamAppUtils.isGameInCategory(game, SteamAppUtils.ERROR_CATEGORY_IDS));
        const games = appDetailList.filter(game => SteamAppUtils.isGameInCategory(game, categoryIds));

        // Input and output to messages
        const unknownGameMessageEmbeds = this.steamGameMessageFormatter.formatAsUrlList(
            unknownGames,
            locale.command.letsplay.games_without_info,
            locale.command.letsplay.you_could_play_these,
            locale.command.letsplay.games_without_info_detailed
        );
        const categoryNames = categoryIds.map(id => SteamAppUtils.getCategoryName(id)).join(', ');
        const gameMessageEmbeds = this.steamGameMessageFormatter.formatAsDetailedFields(games, locale.command.letsplay.you_could_play_these, categoryNames);
        const messages = gameMessageEmbeds.concat(unknownGameMessageEmbeds);

        // Reply
        return interaction.editReply(MessagePayload.create(interaction, {embeds: [messages[0]]})).then(async (sentMessage) => {
            await this.messagePagingService.addPaging(sentMessage.id, messages);
            return MessagePagingUtils.addControls(message);
        });
    }

    getSlashCommand(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName("letsplay")
            .addStringOption(option => option
                .setName(this.ARG_CATEGORY)
                .setDescription("Category")
                .addChoice("All", "default")
                .addChoice("Co-Op", "coop")
                .addChoice("MMO", "mmo"))
            .addUserOption(option => option.setName(this.ARG_USER1).setDescription("User to play with"))
            .addUserOption(option => option.setName(this.ARG_USER2).setDescription("User to play with"))
            .addUserOption(option => option.setName(this.ARG_USER3).setDescription("User to play with"))
            .addUserOption(option => option.setName(this.ARG_USER4).setDescription("User to play with"))
            .setDescription(locale.command.letsplay.help.description);
    }

    private isUser(user: User | null): user is User {
        return !!user;
    }
}
