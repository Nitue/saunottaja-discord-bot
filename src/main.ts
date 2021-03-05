import {Client as DiscordClient, Message} from "discord.js";
import dotenv from "dotenv";
import {Client as PgClient} from "pg";
import SteamIdRepository from "./steam/steam-id-repository";
import SteamGameMessageFormatter from "./commands/letsplay/steam-game-message-formatter";
import LetsPlayCommand from "./commands/letsplay/lets-play-command";
import SteamApi from "./steam/api/steam-api";
import RegisterSteamIdCommand from "./commands/register-steam-id-command";
import HelpCommand from "./commands/help-command";
import CommandService from "./commands/command-service";
import LetsPlayRandom from "./commands/letsplay/lets-play-random";
import LetsPlayList from "./commands/letsplay/lets-play-list";
import migrate from "./db/migration";

// Load environment variables from ./.env
dotenv.config();

// Composition root
const pgClient = new PgClient({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.ENVIRONMENT === 'prod' ? {rejectUnauthorized: false} : false
});
const discordClient = new DiscordClient();
const steamIdRepository = new SteamIdRepository(pgClient);
const letsPlayMessageFormatter = new SteamGameMessageFormatter();
const steamApi = new SteamApi();
const letsPlayRandom = new LetsPlayRandom(steamApi, letsPlayMessageFormatter);
const letsPlayList = new LetsPlayList(steamApi, letsPlayMessageFormatter);
const commands = [
    new LetsPlayCommand(steamIdRepository, steamApi, letsPlayRandom, letsPlayList),
    new RegisterSteamIdCommand(steamIdRepository)
];
const defaultCommand = new HelpCommand(commands);
const commandService = new CommandService(commands, defaultCommand, discordClient, steamIdRepository);

// Connect to database
pgClient.connect()
    .then(() => migrate(pgClient))
    .catch(error => {
        console.error('Could not connect to database', error);
        process.exit(-1)
    });

// Discord bot event listeners
discordClient.on("ready", () => {
    console.log(`Ready as ${discordClient.user?.tag}`);
});
discordClient.on("message", (message: Message) => {
    const command = commandService.findCommand(message);
    if (command) {
        console.log(`Executing command: ${command.constructor.name}`);
        command.execute(message).then(() => console.log(`Command execution finished: ${command.constructor.name}`));
    }
});
discordClient.login(process.env.DISCORD_BOT_TOKEN);

const shutdown = () => {
    console.log("Shutting down...");
    discordClient.destroy();
    console.log("Discord client disconnected");
    pgClient.end().then(() => {
        console.log("PgClient disconnected");
        process.exit(0);
    });
}
process.on("SIGINT", shutdown);
process.on("exit", () => process.stdout.write('Good bye'));
