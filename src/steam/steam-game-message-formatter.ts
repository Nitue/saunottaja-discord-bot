import {EmbedFieldData, MessageEmbed} from "discord.js";
import SteamAppUtils from "./steam-app-utils";
import _ from "lodash";
import {singleton} from "tsyringe";

@singleton()
export default class SteamGameMessageFormatter {
    public formatAsDetailedFields(games: SteamGameDetails[], title: string, footer?: string): MessageEmbed[] {
        return _.chunk(games, 25).map((chunk, index, arr) => {
            const page = index + 1;
            let embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${title} ${page}/${arr.length}`)
                .addFields(this.getGamesAsEmbedFieldList(chunk, index * 25));
            if (footer) {
                embed = embed.setFooter(footer);
            }
            return embed;
        })
    }

    public formatAsUrlList(games: SteamGameDetails[], title: string, fieldTitle: string, description: string): MessageEmbed[] {
        if (!games || games.length === 0) {
            return [];
        }
        const gamesList = games.map(game => SteamAppUtils.getStoreURL(game.steam_appid));
        return _.chunk(gamesList, 20).map((chunk, index, arr) => {
            const page = index + 1;
            return new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${title} ${page}/${arr.length}`)
                .setDescription(description)
                .addFields({
                    name: fieldTitle,
                    value: chunk.join('\n')
                });
        });
    }

    public formatSingleGame(game: SteamGameDetails, title: string): MessageEmbed {
        return new MessageEmbed()
            .setAuthor(title)
            .setColor("#0099ff")
            .setTitle(game.name)
            .setDescription(game.short_description)
            .setThumbnail(game.header_image)
            .setFooter(game.genres.map(genre => genre.description).join(", "))
            .setURL(SteamAppUtils.getStoreURL(game.steam_appid));
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
}
