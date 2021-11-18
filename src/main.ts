import "reflect-metadata";

// Load environment variables from ./.env
import dotenv from "dotenv";
dotenv.config();

import {REST} from "@discordjs/rest";
import {Client as DiscordClient, Intents} from "discord.js";
import {container} from "tsyringe";
import LetsPlayCommand from "./commands/letsplay/lets-play-command";
import RegisterSteamIdCommand from "./commands/register-steam-id-command";
import {Client as PgClient} from "pg";
import App from "./app";
import NextPageReaction from "./reactions/next-page-reaction";
import PreviousPageReaction from "./reactions/previous-page-reaction";
import SuggestCommand from "./commands/suggest-command";
import LetsBuyCommand from "./commands/lets-buy-command";

// Register db client
const pgClient = new PgClient({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.ENVIRONMENT === 'prod' ? {rejectUnauthorized: false} : false
});
container.registerInstance("pgClient", pgClient);

// Register discord client
const discordClient = new DiscordClient({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS], partials: ["REACTION", "MESSAGE", "CHANNEL"] });
container.registerInstance("discordClient", discordClient);

// Register discord REST API
const rest = new REST({version: '9'}).setToken(process.env.DISCORD_BOT_TOKEN as string);
container.registerInstance("discordRest", rest);

// Register commands
container.register("commands", {
    useValue: [
        container.resolve(LetsPlayCommand),
        container.resolve(LetsBuyCommand),
        container.resolve(SuggestCommand),
        container.resolve(RegisterSteamIdCommand)
    ]
});

// Register reactions
container.register("reactions", {
    useValue: [
        container.resolve(NextPageReaction),
        container.resolve(PreviousPageReaction)
    ]
});

// Shutdown clean up
const shutdown = async () => {
    console.log("Shutting down...");
    discordClient.destroy();
    console.log("Discord client disconnected");
    await pgClient.end().then(() => {
        console.log("PgClient disconnected");
        process.exit(0);
    });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("exit", () => process.stdout.write('Good bye\n\n'));

// Start the application
const app = container.resolve(App);
app.run().then(() => console.log("Application started"))
