import {Message, MessageEmbed, User} from "discord.js";
import SteamApi from "../../steam/api/steam-api";
import SteamIdRepository from "../../steam/steam-id-repository";
import BasicCommand from "../basic-command";
import SteamId from "../../steam/steam-id";
import SteamAppUtils from "../../steam/steam-app-utils";
import SteamGameMessageFormatter from "./steam-game-message-formatter";
import CommandUtils from "../command-utils";
import LetsPlayUtils from "./lets-play-utils";
import LetsPlayRandom from "./lets-play-random";

export default class LetsPlayCommand extends BasicCommand {

    constructor(
        private steamIdRepository: SteamIdRepository,
        private steamApi: SteamApi,
        private letsPlayRandom: LetsPlayRandom,
        private steamGameMessageFormatter: SteamGameMessageFormatter
    ) {
        super();
    }

    async execute(message: Message): Promise<any> {
        const users = this.getUsers(message);

        // Check that there's enough users
        if (users.length < 1) {
            return message.channel.send(new MessageEmbed().addFields(CommandUtils.getCommandHelpAsEmbedField(this)));
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
        const categoryIds = LetsPlayUtils.getCategoryIds(message);

        const isRandomRequested = message.content.includes("random");

        if (isRandomRequested) {
            const randomGame = await this.letsPlayRandom.getRandomGame(matchingAppIds, categoryIds);
            if (randomGame === undefined) {
                return message.channel.send("Nyt kävi vähän niin, etten löytänyt riittävän nopeasti peliä, joka olisi sopinut hakukriteereihin. Kokeileppa uudelleen...");
            }
            return message.channel.send(this.steamGameMessageFormatter.formatSingleGame(randomGame, "Miten olisi vaikkapa..."));
        }

        // Get details of each app ID from Steam
        const games = await this.getSteamAppDetails(matchingAppIds);

        // Filter games by categories
        const errorGames = games.filter(game => SteamAppUtils.isGameInCategory(game, SteamAppUtils.ERROR_CATEGORY_IDS));
        const gamesToPlay = games.filter(game => SteamAppUtils.isGameInCategory(game, categoryIds));

        const errorGameMessageEmbeds = this.steamGameMessageFormatter.formatAsUrlList(
            errorGames,
            "Pelejä, joista ei voitu hakea tietoja",
            "Voisitte pelailla vaikka näitä pelejä",
            "Näistä peleistä ei saatu haettua lisätietoja. Syynä voi olla väliaikaiset verkko-ongelmat. Lista voi sisältää yksinpelejä."
        );
        const gameMessageEmbeds = this.steamGameMessageFormatter.formatAsDetailedFields(gamesToPlay, categoryIds, "Voisitte pelailla vaikka näitä pelejä");

        return gameMessageEmbeds.concat(errorGameMessageEmbeds).map(content => message.channel.send(content));
    }

    getHelp(): [string, string] {
        return ['letsplay [random] [<tyhjä>/coop/mmo] <@Käyttäjä1> <@Käyttäjä2> ... <@KäyttäjäN>', 'Ilmoittaa mitä Steam pelejä voisitte pelata. Rekisteröi Steam-tunnus ensin \`steamid\`-komennolla.'];
    }

    getKeyword(): string {
        return "letsplay";
    }

    private sendAcknowledgement(message: Message): Promise<any> {
        return message.channel.send('Hmm... Odotas hetki, niin maiskuttelen tätä datan määrää vähän...');
    }

    private getUsers(message: Message): User[] {
        return message.mentions.users.filter(user => user.id !== message.client.user?.id).array();
    }

    private getSteamIds(users: User[]): Promise<SteamId[]> {
        return Promise.all(users.map(user => this.steamIdRepository.getByDiscordUserId(user.id)));
    }

    private getUserSteamAppIds(steamIds: SteamId[]): Promise<number[][]> {
        const requests = steamIds.map(steamId => this.steamApi.getOwnedGames(steamId.steamId as string)
            .then(ownedGames => ownedGames.games.map(game => game.appid))
            .catch(error => {
                console.warn('Failed to get owned games', error.message);
                return [] as number[];
            }))
        return Promise.all(requests);
    }

    private getUsersWithoutSteamId(message: Message, steamIds: SteamId[]): string[]  {
        const notFoundSteamIds = steamIds.filter(steamId => !steamId.steamId);
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

    private async getSteamAppDetails(appIds: number[]): Promise<SteamGameDetails[]> {
        const gameDetails = await Promise.all(appIds.map(appId => this.steamApi.getAppDetails(appId)
            .catch(error => {
                console.warn('Failed to get app details:', error.message);
                return SteamAppUtils.getErrorGameDetails(error.config.params.appids);
            })));
        return gameDetails.filter(details => !!details);
    }
}
