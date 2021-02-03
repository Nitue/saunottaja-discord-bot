import {EmbedFieldData, MessageEmbed} from "discord.js";
import SteamAppUtils from "../../steam/steam-app-utils";

export default class LetsPlayMessageFormatter {
    public format(games: SteamGameDetails[], errorGames: SteamGameDetails[], categoryIds: number[]): MessageEmbed {
        const gamesList = this.getGamesAsEmbedFieldList(games);
        if (errorGames.length > 0) {
            const errorGamesField = this.getGamesAsSingleEmbedField(errorGames, 'Pelejä, joista ei voitu hakea tietoja');
            gamesList.push(errorGamesField);
        }
        const categories = categoryIds.map(id => SteamAppUtils.getCategoryName(id));
        return new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Voisitte pelailla vaikka näitä pelejä...')
            .addFields(gamesList)
            .setFooter(categories.join(', '));
    }

    private getGamesAsEmbedFieldList(games: SteamGameDetails[]): EmbedFieldData[] {
        return games.map((game, index) => this.getGameAsEmbedField(game, index + 1));
    }

    private getGameAsEmbedField(game: SteamGameDetails, runningNumber?: number): EmbedFieldData {
        const storeUrl = SteamAppUtils.getStoreURL(game.steam_appid);
        const runningNumberText = runningNumber ? `${runningNumber}. ` : '';
        return {
            name: `${runningNumberText}${game.name}`,
            value: storeUrl,
            inline: true
        };
    }

    private getGamesAsSingleEmbedField(games: SteamGameDetails[], fieldTitle: string): EmbedFieldData {
        const errorGamesList = games.map(game => SteamAppUtils.getStoreURL(game.steam_appid)).join('\n');
        return {
            name: fieldTitle,
            value: errorGamesList,
            inline: false
        };
    }
}
