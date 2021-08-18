import {MessageEmbed} from "discord.js";

export default class CommandInputValidationResult {

    public get isInvalid(): boolean {
        return !this.isValid;
    }

    constructor(
        public readonly isValid: boolean,
        public readonly message?: string | MessageEmbed,
    ) {
    }
}