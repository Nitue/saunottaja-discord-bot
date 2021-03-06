export default class User {
    constructor(
        public discordUserId: string,
        public steamId?: string,
        public id?: number
    ) {}
}
