require("axios-debug-log");
import {Client as DiscordClient, Message} from "discord.js";
import CommandService from "./commands/command-service";
import {Client as PgClient} from "pg";
import dotenv from "dotenv";
import SteamIdRepository from "./steam/steam-id-repository";

// Load environment variables from ./.env
dotenv.config();

// Intialize postgres client
const pgClient = new PgClient({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});
pgClient.connect();

// Initialize other required services
const steamIdRepository = new SteamIdRepository(pgClient);
const discordClient = new DiscordClient();
const commandService = new CommandService(discordClient, steamIdRepository);

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
