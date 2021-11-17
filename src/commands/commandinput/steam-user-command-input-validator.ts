import {locale, LocaleUtils} from "../../locale/locale-utils";
import CommandInput from "./command-input";
import CommandInputValidationResult from "./command-input-validation-result";
import {singleton} from "tsyringe";

@singleton()
export default class SteamUserCommandInputValidator {
    validate(input: CommandInput, requiredUserCount: number): CommandInputValidationResult {
        // Check that there's enough users
        if (input.users.length < requiredUserCount) {
            return new CommandInputValidationResult(false);
        }

        // Check that everyone has steam id
        if (input.usersWithoutSteamId.length > 0) {
            const usernames = input.usersWithoutSteamId.map(user => user.username);
            const errorMessage = LocaleUtils.process(locale.generic.steam_account_missing, [usernames.join(', ')]);
            return new CommandInputValidationResult( false, errorMessage);
        }
        return new CommandInputValidationResult(true);
    }

}