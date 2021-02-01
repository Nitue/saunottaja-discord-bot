import {Client, Message, User} from "discord.js";
import SteamApi from "../steam/api/steam-api";
import SteamIdRepository from "../steam/steam-id-repository";
import BasicCommand from "./basic-command";
import SteamId from "../steam/steam-id";
import settings from "../settings.json";

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

        //
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

        // Filter games by category
        const gamesToPlay = games
            .filter(game => !!game)
            .filter(game => this.isGameInCategory(game, settings.letsplay.categories.default))
            .map(game => game.name);

        return message.channel.send(this.formatGamesResponse(gamesToPlay));
    }

    getHelp(): string {
        return `\`letsplay <@Käyttäjä1> <@Käyttäjä2> ... <@KäyttäjäN>\` ilmoittaa mitä Steam pelejä voisitte pelata. Rekisteröi Steam-tunnus ensin \`steamid\`-komennolla.`;
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

    private formatGamesResponse(games: string[]): string {
        const gamesList = games.map((game, index) => `${index+1}. ${game}`);
        return `Voisitte pelailla näitä pelejä:\n${gamesList.join('\n')}`;
    }

    private getMatchingAppIds(userAppIds: number[][]): number[]  {
        return userAppIds.reduce((previousAppIds, nextAppIds) => {
            return previousAppIds.filter(x => nextAppIds.includes(x));
        });
    }

    private isGameInCategory(game: SteamGameDetails, categories: number[]): boolean {
        const gameCategories = game.categories.map(category => category.id);
        return categories.some(requiredCategory => gameCategories.includes(requiredCategory));
    }

    private async getSteamAppDetails(matchingAppIds: number[]): Promise<SteamGameDetails[]> {
        return Promise.all(matchingAppIds
            .map(appId => this.steamApi.getAppDetails(appId)));
    }
}
