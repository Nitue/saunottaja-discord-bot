import {locale} from "../locale/locale-utils";
import ArrayUtils from "../common/array-utils";
import SteamAppUtils from "../steam/steam-app-utils";
import SteamApi from "../steam/api/steam-api";
import SteamGameMessageFormatter from "../steam/steam-game-message-formatter";
import LetsPlayUtils from "./letsplay/lets-play-utils";
import UserRepository from "../users/user-repository";
import {singleton} from "tsyringe";
import Command from "./command";
import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction, MessagePayload, User} from "discord.js";

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
        const discordUsers = this.ARG_USERS.map(arg => interaction.options.getUser(arg)).filter(this.isUser);
        const users = await this.userRepository.getUsers(discordUsers);
        const appIds = await this.steamApi.getMatchingAppIds(users);
        const categoryIds = LetsPlayUtils.getCategoryIds(interaction.options.getString(this.ARG_CATEGORY) as string | undefined);

        await interaction.deferReply();

        const randomGame = await this.getRandomGame(appIds, categoryIds);
        if (randomGame === undefined) {
            return interaction.editReply(locale.command.suggest.random_death_switch);
        }
        return interaction.editReply(MessagePayload.create(interaction, {embeds: [this.steamGameMessageFormatter.formatSingleGame(randomGame, locale.command.suggest.how_about)]}));
    }

    getSlashCommand(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName("suggest")
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
            .setDescription(locale.command.suggest.help.description);
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

    private isUser(user: User | null): user is User {
        return !!user;
    }
}