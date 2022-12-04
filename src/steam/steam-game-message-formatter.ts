import {APIEmbedField, EmbedBuilder} from "discord.js";
import SteamAppUtils from "./steam-app-utils";
import _ from "lodash";
import {singleton} from "tsyringe";

@singleton()
export default class SteamGameMessageFormatter {
    public formatAsMessageEmbeds(games: SteamGameDetails[], title: string, footer?: string): EmbedBuilder[] {
        return _.chunk(games, 25).map((chunk, index, arr) => {
            const page = index + 1;
            let embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${title} ${page}/${arr.length}`)
                .addFields(this.getGamesAsEmbedFieldList(chunk, index * 25));
            if (footer) {
                embed = embed.setFooter({text: footer});
            }
            return embed;
        })
    }

    public formatAsUrlList(games: SteamGameDetails[], title: string, fieldTitle: string, description: string): EmbedBuilder[] {
        if (!games || games.length === 0) {
            return [];
        }
        const gamesList = games.map(game => SteamAppUtils.getStoreURL(game.steam_appid));
        return _.chunk(gamesList, 20).map((chunk, index, arr) => {
            const page = index + 1;
            return new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${title} ${page}/${arr.length}`)
                .setDescription(description)
                .addFields({
                    name: fieldTitle,
                    value: chunk.join('\n')
                });
        });
    }

    public formatSingleGame(game: SteamGameDetails, title: string): EmbedBuilder {
        return new EmbedBuilder()
            .setAuthor({name: title})
            .setColor("#0099ff")
            .setTitle(game.name)
            .setDescription(game.short_description)
            .setThumbnail(game.header_image)
            .setFooter({text: game.genres.map(genre => genre.description).join(", ")})
            .setURL(SteamAppUtils.getStoreURL(game.steam_appid));
    }

    private getGamesAsEmbedFieldList(games: SteamGameDetails[], runningNumberConstant: number): APIEmbedField[] {
        return games.map((game, index) => this.getGameAsEmbedField(game, index + 1 + runningNumberConstant));
    }

    private getGameAsEmbedField(game: SteamGameDetails, runningNumber?: number): APIEmbedField {
        const storeUrl = SteamAppUtils.getStoreURL(game.steam_appid);
        const runningNumberText = runningNumber ? `${runningNumber}. ` : '';
        return {
            name: `${runningNumberText}${game.name}`,
            value: storeUrl,
            inline: true
        };
    }
}
