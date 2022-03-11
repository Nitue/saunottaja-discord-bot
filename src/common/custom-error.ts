export default class CustomError extends Error {

    public originalError: Error;

    constructor(message: string, error?: Error | any) {
        super(message);
        this.stack = this.stack + "\n" + error?.stack;
        this.originalError = error;
    }
}