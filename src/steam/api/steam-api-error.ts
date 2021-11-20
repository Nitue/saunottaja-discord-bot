import CustomError from "../../common/custom-error";

export class SteamApiError extends CustomError {
    constructor(message: string, error: Error | any) {
        super(`Steam API error: ${message}`, error);
    }
}