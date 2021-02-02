import {Client, Message, MessageEmbed, User} from "discord.js";
import SteamApi from "../steam/api/steam-api";
import SteamIdRepository from "../steam/steam-id-repository";
import BasicCommand from "./basic-command";
import SteamId from "../steam/steam-id";
import settings from "../settings.json";
import SteamAppUtils from "../steam/steam-app-utils";

export default class LetsPlayCommand extends BasicCommand {

    constructor(
        private client: Client,
        private steamIdRepository: SteamIdRepository,
        private steamApi: SteamApi
    ) {
        super();
    }

    async execute(message: Message): Promise<any> {
        const users = this.getUsers(message);

        // Check that there's enough users
        if (users.length < 1) {
            return message.channel.send(this.getHelp());
        }

        // Tell the user that parameters were fine and actual execution starts
        await this.sendAcknowledgement(message);

        // Get Steam IDs for the users
        const steamIds = await this.getSteamIds(users);

        // Check if some user's have not registered their Steam account
        const notFoundUsers = this.getUsersWithoutSteamId(message, steamIds);
        if (notFoundUsers.length > 0) {
            return message.channel.send(`Näyttää siltä, että Steam-tunnus ei ole rekisteröity käyttäjillä: ${notFoundUsers.join(', ')}. En voi siis selvittää, mitä pelejä voitte pelata. Rekisteröi Steam-tunnus \`steamid\`-komennolla.`)
        }

        // Get list of Steam app IDs each user has
        const userAppIds = await this.getUserSteamAppIds(steamIds);
        const matchingAppIds = this.getMatchingAppIds(userAppIds);

        // Get details of each app ID from Steam
        const games = await this.getSteamAppDetails(matchingAppIds);

        // Choose categories
        const categoryGroup = this.getCategoryGroup(message);
        const categoryIds = (settings.letsplay.categories as any)[categoryGroup];

        // Filter games by categories
        const gamesToPlay = games.filter(game => this.isGameInCategory(game, categoryIds));

        return message.channel.send(this.formatGamesResponse(gamesToPlay, categoryIds));
    }

    getHelp(): [string, string] {
        return ['letsplay [<tyhjä>/coop/mmo] <@Käyttäjä1> <@Käyttäjä2> ... <@KäyttäjäN>', 'Ilmoittaa mitä Steam pelejä voisitte pelata. Rekisteröi Steam-tunnus ensin \`steamid\`-komennolla.'];
    }

    getKeyword(): string {
        return "letsplay";
    }

    private sendAcknowledgement(message: Message): Promise<any> {
        return message.channel.send('Hmm... Odotas hetki, niin maiskuttelen tätä datan määrää vähän...');
    }

    private getUsers(message: Message): User[] {
        return message.mentions.users.filter(user => user.id !== this.client.user?.id).array();
    }

    private getSteamIds(users: User[]): Promise<SteamId[]> {
        return Promise.all(users.map(user => this.steamIdRepository.getByDiscordUserId(user.id)));
    }

    private getUserSteamAppIds(steamIds: SteamId[]): Promise<number[][]> {
        return Promise.all(steamIds.map(steamId => this.steamApi.getOwnedGames(steamId.steamId as string)
            .then(ownedGames => ownedGames.games.map(game => game.appid))));
    }

    private getUsersWithoutSteamId(message: Message, steamIds: SteamId[]): string[]  {
        const notFoundSteamIds = steamIds.filter(steamId => !steamId.steamId);
        return notFoundSteamIds
            .map(steamId => message.mentions.users.find(user => user.id === steamId.discordUserId))
            .map(user => user?.username)
            .filter(username => !!username)
            .map(username => username as string);
    }

    private formatGamesResponse(games: SteamGameDetails[], categoryIds: number[]): MessageEmbed {
        const gamesList = games.map((game, index) => {
            const storeUrl = SteamAppUtils.getStoreURL(game.steam_appid);
            return {name: `${index+1}. ${game.name}`, value: storeUrl, inline: true};
        });
        const categories = categoryIds.map(id => SteamAppUtils.getCategoryName(id));
        return new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Voisitte pelailla vaikka näitä pelejä...')
            .addFields(gamesList)
            .setFooter(categories.join(', '));
    }

    private getMatchingAppIds(userAppIds: number[][]): number[]  {
        return userAppIds.reduce((previousAppIds, nextAppIds) => {
            return previousAppIds.filter(x => nextAppIds.includes(x));
        });
    }

    private isGameInCategory(game: SteamGameDetails, categoryIds: number[]): boolean {
        const gameCategories = game.categories.map(category => category.id);
        return categoryIds.some(requiredCategory => gameCategories.includes(requiredCategory));
    }

    private async getSteamAppDetails(matchingAppIds: number[]): Promise<SteamGameDetails[]> {
        const requests = await Promise.all(matchingAppIds.map(appId => this.steamApi.getAppDetails(appId)));
        return requests.filter(game => !!game);
    }

    private getCategoryGroup(message: Message): string {
        const args = message.content.split(' ');
        const categoryGroups = Object.keys(settings.letsplay.categories);
        const categoryGroup = args.find(arg => categoryGroups.includes(arg));
        return categoryGroup === undefined ? 'default' : categoryGroup;
    }
}
