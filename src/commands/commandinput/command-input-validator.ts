import CommandInput from "./command-input";
import CommandInputValidationResult from "./command-input-validation-result";

export default interface CommandInputValidator {
    validate(input: CommandInput): CommandInputValidationResult;
}