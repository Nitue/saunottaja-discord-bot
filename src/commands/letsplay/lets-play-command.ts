import {Message, MessageEmbed, User as DiscordUser} from "discord.js";
import SteamApi from "../../steam/api/steam-api";
import UserRepository from "../../users/user-repository";
import BasicCommand from "../basic-command";
import User from "../../users/user";
import CommandUtils from "../command-utils";
import LetsPlayUtils from "./lets-play-utils";
import LetsPlayRandom from "./lets-play-random";
import LetsPlayList from "./lets-play-list";
import {locale, LocaleUtils} from "../../locale/locale-utils";
import {singleton} from "tsyringe";
import MessagePagingService from "../../messages/message-paging-service";
import MessagePagingUtils from "../../messages/message-paging-utils";

@singleton()
export default class LetsPlayCommand extends BasicCommand {

    constructor(
        private userRepository: UserRepository,
        private steamApi: SteamApi,
        private letsPlayRandom: LetsPlayRandom,
        private letsPlayList: LetsPlayList,
        private messagePagingService: MessagePagingService
    ) {
        super();
    }

    async execute(message: Message): Promise<any> {
        const discordUsers = this.getDiscordUsers(message);

        // Check that there's enough users
        if (discordUsers.length < 1) {
            return message.channel.send(new MessageEmbed().addFields(CommandUtils.getCommandHelpAsEmbedField(this)));
        }

        // Tell the user that parameters were fine and actual execution starts
        await message.react('👍');

        // Get Steam IDs for the users
        const users = await this.getUsers(discordUsers);

        // Check if some user's have not registered their Steam account
        const notFoundUsers = this.getUsersWithoutSteamId(message, users);
        if (notFoundUsers.length > 0) {
            return message.channel.send(LocaleUtils.process(locale.command.letsplay.steam_account_missing, [notFoundUsers.join(', ')]));
        }

        // Get list of Steam app IDs each user has
        const userAppIds = await this.getUserSteamAppIds(users);
        const matchingAppIds = this.getMatchingAppIds(userAppIds);
        const categoryIds = LetsPlayUtils.getCategoryIds(message);

        // If 'random', do the 'random' letsplay
        const isRandomRequested = message.content.includes("random");
        if (isRandomRequested) {
            const response = await this.letsPlayRandom.execute(matchingAppIds, categoryIds);
            return message.channel.send(response);
        }

        // Otherwise do normal 'list' letsplay
        const messages = await this.letsPlayList.execute(matchingAppIds, categoryIds);
        return message.channel.send(messages[0]).then(async (sentMessage) => {
            await this.messagePagingService.addPaging(sentMessage.id, messages);
            return MessagePagingUtils.addControls(sentMessage);
        });
    }

    getHelp(): [string, string] {
        return [locale.command.letsplay.help.command, locale.command.letsplay.help.description];
    }

    getKeyword(): string {
        return "letsplay";
    }

    private getDiscordUsers(message: Message): DiscordUser[] {
        return message.mentions.users.filter(user => user.id !== message.client.user?.id).array();
    }

    private getUsers(discordUsers: DiscordUser[]): Promise<User[]> {
        return Promise.all(discordUsers.map(discordUser => this.userRepository.getByDiscordUserId(discordUser.id)));
    }

    private getUserSteamAppIds(steamIds: User[]): Promise<number[][]> {
        const requests = steamIds.map(steamId => this.steamApi.getOwnedGames(steamId.steamId as string)
            .then(ownedGames => ownedGames.games.map(game => game.appid))
            .catch(error => {
                console.warn('Failed to get owned games', error.message);
                return [] as number[];
            }))
        return Promise.all(requests);
    }

    private getUsersWithoutSteamId(message: Message, users: User[]): string[]  {
        const notFoundSteamIds = users.filter(user => !user.steamId);
        return notFoundSteamIds
            .map(steamId => message.mentions.users.find(user => user.id === steamId.discordUserId))
            .map(user => user?.username)
            .filter(username => !!username)
            .map(username => username as string);
    }

    private getMatchingAppIds(userAppIds: number[][]): number[]  {
        return userAppIds.reduce((previousAppIds, nextAppIds) => {
            return previousAppIds.filter(x => nextAppIds.includes(x));
        });
    }
}
