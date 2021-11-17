import BasicCommand from "./basic-command";
import CommandInput from "./commandinput/command-input";
import {locale} from "../locale/locale-utils";
import CommandUtils from "./command-utils";
import SteamUserCommandInputValidator from "./commandinput/steam-user-command-input-validator";
import UserRepository from "../users/user-repository";
import SteamApi from "../steam/api/steam-api";
import ArrayUtils from "../common/array-utils";
import _ from "lodash";
import SteamGameMessageFormatter from "../steam/steam-game-message-formatter";
import MessagePagingUtils from "../messages/message-paging-utils";
import MessagePagingService from "../messages/message-paging-service";
import {singleton} from "tsyringe";
import SteamAppUtils from "../steam/steam-app-utils";
import settings from '../settings.json';

@singleton()
export default class LetsBuyCommand extends BasicCommand {

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
        const validationResult = this.validator.validate(input, 3);
        if (validationResult.isInvalid) {
            return input.message.channel.send(validationResult.message ? validationResult.message : CommandUtils.getCommandHelpAsMessageEmbed(this));
        }
        input.message.react('👍');

        const usersAppIdLists = await this.steamApi.getUsersAppIdLists(input.users);
        const appIdOccurrences = ArrayUtils.getOccurrences(usersAppIdLists);
        const requiredOccurrences = Math.ceil(input.users.length / 2);
        const appIds = _.keys(_.pickBy(appIdOccurrences, occurrenceCount => occurrenceCount >= requiredOccurrences && occurrenceCount < input.users.length))
            .map(appId => Number(appId));
        const allGames = await this.steamApi.getManyAppDetails(appIds);
        const games = allGames.filter(game => SteamAppUtils.isGameInCategory(game, settings.letsplay.categories.default));

        const messages = this.steamGameMessageFormatter.formatAsDetailedFields(games, locale.command.letsbuy.buy_these);

        // Reply
        return input.message.channel.send(messages[0]).then(async (sentMessage) => {
            await this.messagePagingService.addPaging(sentMessage.id, messages);
            return MessagePagingUtils.addControls(sentMessage);
        });
    }

    getHelp(): [string, string] {
        return [locale.command.letsbuy.help.command, locale.command.letsbuy.help.description];
    }

    getKeyword(): string {
        return "letsbuy";
    }

}