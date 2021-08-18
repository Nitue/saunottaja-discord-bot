import SteamApi from "../../steam/api/steam-api";
import UserRepository from "../../users/user-repository";
import BasicCommand from "../basic-command";
import LetsPlayUtils from "./lets-play-utils";
import {locale} from "../../locale/locale-utils";
import {singleton} from "tsyringe";
import MessagePagingService from "../../messages/message-paging-service";
import MessagePagingUtils from "../../messages/message-paging-utils";
import SteamAppUtils from "../../steam/steam-app-utils";
import SteamGameMessageFormatter from "../../steam/steam-game-message-formatter";
import CommandInput from "../commandinput/command-input";
import SteamUserCommandInputValidator from "../commandinput/steam-user-command-input-validator";
import CommandUtils from "../command-utils";

@singleton()
export default class LetsPlayCommand extends BasicCommand {

    constructor(
        private validator: SteamUserCommandInputValidator,
        private userRepository: UserRepository,
        private steamApi: SteamApi,
        private messagePagingService: MessagePagingService,
        private steamGameMessageFormatter: SteamGameMessageFormatter
    ) {
        super();
    }

    async execute(input: CommandInput): Promise<any> {

        // Validate input parameters
        const validationResult = this.validator.validate(input);
        if (validationResult.isInvalid) {
            return input.message.channel.send(validationResult.message ? validationResult.message : CommandUtils.getCommandHelpAsMessageEmbed(this));
        }
        input.message.react('👍');

        // Get categories from input
        const categoryIds = LetsPlayUtils.getCategoryIds(input.message);

        // Find out games and their details
        const appIds = await this.steamApi.getMatchingAppIds(input.users);
        const appDetailList = await this.getSteamAppDetails(appIds);
        const unknownGames = appDetailList.filter(game => SteamAppUtils.isGameInCategory(game, SteamAppUtils.ERROR_CATEGORY_IDS));
        const games = appDetailList.filter(game => SteamAppUtils.isGameInCategory(game, categoryIds));

        // Input and output to messages
        const unknownGameMessageEmbeds = this.steamGameMessageFormatter.formatAsUrlList(
            unknownGames,
            locale.command.letsplay.games_without_info,
            locale.command.letsplay.you_could_play_these,
            locale.command.letsplay.games_without_info_detailed
        );
        const categoryNames = categoryIds.map(id => SteamAppUtils.getCategoryName(id)).join(', ');
        const gameMessageEmbeds = this.steamGameMessageFormatter.formatAsDetailedFields(games, locale.command.letsplay.you_could_play_these, categoryNames);
        const messages = gameMessageEmbeds.concat(unknownGameMessageEmbeds);

        // Reply
        return input.message.channel.send(messages[0]).then(async (sentMessage) => {
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

    private async getSteamAppDetails(appIds: number[]): Promise<SteamGameDetails[]> {
        const gameDetails = await Promise.all(appIds.map(appId => this.steamApi.getAppDetails(appId)
            .catch(error => {
                console.warn('Failed to get app details:', error.message);
                return SteamAppUtils.getErrorGameDetails(error.config.params.appids);
            })));
        return gameDetails.filter(details => !!details);
    }
}
