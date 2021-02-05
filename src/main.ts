import {Client as DiscordClient, Message} from "discord.js";
import dotenv from "dotenv";
import {Client as PgClient} from "pg";
import SteamIdRepository from "./steam/steam-id-repository";
import LetsPlayMessageFormatter from "./commands/letsplay/lets-play-message-formatter";
import LetsPlayCommand from "./commands/letsplay/lets-play-command";
import SteamApi from "./steam/api/steam-api";
import RegisterSteamIdCommand from "./commands/register-steam-id-command";
import HelpCommand from "./commands/help-command";
import CommandService from "./commands/command-service";
import fs from "fs";
import * as path from "path";

// Load environment variables from ./.env
dotenv.config();

const setupDatabaseScript = fs.readFileSync(path.resolve(__dirname, "resources/setup-database.sql")).toString();

// Composition root
const pgClient = new PgClient({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.ENVIRONMENT === 'prod'
});
const discordClient = new DiscordClient();
const steamIdRepository = new SteamIdRepository(pgClient);
const letsPlayMessageFormatter = new LetsPlayMessageFormatter();
const commands = [
    new LetsPlayCommand(discordClient, steamIdRepository, new SteamApi(), letsPlayMessageFormatter),
    new RegisterSteamIdCommand(steamIdRepository)
];
const defaultCommand = new HelpCommand(discordClient, commands);
const commandService = new CommandService(commands, defaultCommand, discordClient, steamIdRepository);

// Connect to database
pgClient.connect()
    .then(() => pgClient.query(setupDatabaseScript))
    .catch(() => {
        console.error('Could not connect to database');
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
