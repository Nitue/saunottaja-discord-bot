import {EmbedFieldData, MessageEmbed} from "discord.js";
import SteamAppUtils from "../../steam/steam-app-utils";

export default class LetsPlayMessageFormatter {
    public formatAsDetailedFields(games: SteamGameDetails[], categoryIds: number[]): MessageEmbed[] {
        const categories = categoryIds.map(id => SteamAppUtils.getCategoryName(id));
        const footer = categories.join(', ');
        return this.chunk(games, 25).map((chunk, index, arr) => {
            const page = index + 1;
            return new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`Voisitte pelailla vaikka näitä pelejä ${page}/${arr.length}`)
                .addFields(this.getGamesAsEmbedFieldList(chunk, index * 25))
                .setFooter(footer);
        })
    }

    public formatAsUrlList(games: SteamGameDetails[], title: string, description: string): MessageEmbed[] {
        if (!games || games.length === 0) {
            return [];
        }
        const gamesList = games.map(game => SteamAppUtils.getStoreURL(game.steam_appid));
        return this.chunk<string>(gamesList, 20).map((chunk, index, arr) => {
            const page = index + 1;
            return new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${title} ${page}/${arr.length}`)
                .setDescription(description)
                .addFields({
                    name: 'Voisitte pelailla vaikka näitä pelejä',
                    value: chunk.join('\n')
                });
        });
    }

    private getGamesAsEmbedFieldList(games: SteamGameDetails[], runningNumberConstant: number): EmbedFieldData[] {
        return games.map((game, index) => this.getGameAsEmbedField(game, index + 1 + runningNumberConstant));
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

    private chunk<T>(arr: T[], n: number): T[][] {
        return arr.slice(0,(arr.length+n-1)/n|0).map((c,i) => arr.slice(n*i,n*i+n));
    }
}
