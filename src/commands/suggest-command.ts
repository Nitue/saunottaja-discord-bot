import {locale, LocaleUtils} from "../locale/locale-utils";
import ArrayUtils from "../common/array-utils";
import SteamAppUtils from "../steam/steam-app-utils";
import SteamApi from "../steam/api/steam-api";
import SteamGameMessageFormatter from "../steam/steam-game-message-formatter";
import UserRepository from "../users/user-repository";
import {singleton} from "tsyringe";
import Command from "./command";
import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction, MessagePayload} from "discord.js";
import CategoryUtils from "../common/category-utils";
import InteractionUtils from "../common/interaction-utils";
import UserUtils from "../users/user-utils";

@singleton()
export default class SuggestCommand implements Command {

    private ARG_CATEGORY = "category";
    private ARG_USER1 = "user1";
    private ARG_USER2 = "user2";
    private ARG_USER3 = "user3";
    private ARG_USER4 = "user4";
    private ARG_USERS = [this.ARG_USER1, this.ARG_USER2, this.ARG_USER3, this.ARG_USER4];

    constructor(
        private userRepository: UserRepository,
        private steamApi: SteamApi,
        private steamGameMessageFormatter: SteamGameMessageFormatter
    ) {}

    async execute(interaction: CommandInteraction): Promise<any> {
        const discordUsers = InteractionUtils.getDiscordUsers(interaction, this.ARG_USERS);
        const users = await this.userRepository.getUsers(discordUsers);
        const usersWithoutSteamId = UserUtils.getUsersWithoutSteamId(discordUsers, users);

        if (usersWithoutSteamId.length > 0) {
            return interaction.editReply(LocaleUtils.process(locale.generic.steam_account_missing, [usersWithoutSteamId.join(", ")]));
        }

        const appIds = await this.steamApi.getMatchingAppIds(users);
        const categoryIds = CategoryUtils.getCategoryIds(interaction.options.getString(this.ARG_CATEGORY));

        await interaction.deferReply();

        const randomGame = await this.getRandomGame(appIds, categoryIds);
        if (randomGame === undefined) {
            return interaction.editReply(locale.command.suggest.reply.random_death_switch);
        }
        return interaction.editReply(MessagePayload.create(interaction, {embeds: [this.steamGameMessageFormatter.formatSingleGame(randomGame, locale.command.suggest.reply.how_about)]}));
    }

    getSlashCommand(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName("suggest")
            .addUserOption(option => option.setName(this.ARG_USER1).setDescription(locale.command.suggest.args.user).setRequired(true))
            .addUserOption(option => option.setName(this.ARG_USER2).setDescription(locale.command.suggest.args.user))
            .addUserOption(option => option.setName(this.ARG_USER3).setDescription(locale.command.suggest.args.user))
            .addUserOption(option => option.setName(this.ARG_USER4).setDescription(locale.command.suggest.args.user))
            .addStringOption(option => option
                .setName(this.ARG_CATEGORY)
                .setDescription(locale.command.suggest.args.category)
                .addChoice("All", "default")
                .addChoice("Co-Op", "coop")
                .addChoice("MMO", "mmo"))
            .setDescription(locale.command.suggest.description);
    }

    private async getRandomGame(appIds: number[], categoryIds: number[]): Promise<SteamGameDetails | undefined> {
        let killSwitchCounter = 0;
        while(killSwitchCounter < 10) {
            const appId = ArrayUtils.getRandomValue(appIds);
            const game = await this.steamApi.getAppDetails(appId);
            if (!game || !SteamAppUtils.isGameInCategory(game, categoryIds)) {
                killSwitchCounter++;
                continue;
            }
            return game;
        }
        console.log(`Killswitched after ${killSwitchCounter} tries!`);
        return undefined;
    }
}