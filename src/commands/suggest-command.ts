import BasicCommand from "./basic-command";
import {locale} from "../locale/locale-utils";
import ArrayUtils from "../common/array-utils";
import SteamAppUtils from "../steam/steam-app-utils";
import SteamApi from "../steam/api/steam-api";
import SteamGameMessageFormatter from "../steam/steam-game-message-formatter";
import LetsPlayUtils from "./letsplay/lets-play-utils";
import UserRepository from "../users/user-repository";
import {singleton} from "tsyringe";
import CommandInput from "./commandinput/command-input";
import SteamUserCommandInputValidator from "./commandinput/steam-user-command-input-validator";
import CommandUtils from "./command-utils";

@singleton()
export default class SuggestCommand extends BasicCommand {

    constructor(
        private validator: SteamUserCommandInputValidator,
        private userRepository: UserRepository,
        private steamApi: SteamApi,
        private steamGameMessageFormatter: SteamGameMessageFormatter
    ) {
        super();
    }

    async execute(input: CommandInput): Promise<any> {

        // Validate input parameters
        const validationResult = this.validator.validate(input, 2);
        if (validationResult.isInvalid) {
            return input.message.channel.send(validationResult.message ? validationResult.message : CommandUtils.getCommandHelpAsMessageEmbed(this));
        }
        input.message.react('👍');

        const appIds = await this.steamApi.getMatchingAppIds(input.users);
        const categoryIds = LetsPlayUtils.getCategoryIds(input.message);

        const randomGame = await this.getRandomGame(appIds, categoryIds);
        if (randomGame === undefined) {
            return locale.command.suggest.random_death_switch;
        }
        return input.message.channel.send(this.steamGameMessageFormatter.formatSingleGame(randomGame, locale.command.suggest.how_about));
    }

    private async getRandomGame(appIds: number[], categoryIds: number[]): Promise<SteamGameDetails | undefined> {
        let killSwitchCounter = 0;
        while(killSwitchCounter < 10) {
            const appId = ArrayUtils.getRandomValue(appIds);
            const game = await this.steamApi.getAppDetails(appId);
            if (!game || !SteamAppUtils.isGameInCategory(game, categoryIds)) {
                killSwitchCounter++;
                continue;
            }
            return game;
        }
        console.log(`Killswitched after ${killSwitchCounter} tries!`);
        return undefined;
    }

    getHelp(): [string, string] {
        return [locale.command.suggest.help.command, locale.command.suggest.help.description];
    }

    getKeyword(): string {
        return "suggest";
    }

}