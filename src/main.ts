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

// Load environment variables from ./.env
dotenv.config();

// Composition root
const pgClient = new PgClient({
    connectionString: process.env.DATABASE_URL,
    ssl: false
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
pgClient.connect();

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
