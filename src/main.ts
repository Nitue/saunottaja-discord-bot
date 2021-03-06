import "reflect-metadata";
import {Client as DiscordClient} from "discord.js";
import dotenv from "dotenv";
import HelpCommand from "./commands/help-command";
import {container} from "tsyringe";
import LetsPlayCommand from "./commands/letsplay/lets-play-command";
import RegisterSteamIdCommand from "./commands/register-steam-id-command";
import {Client as PgClient} from "pg";
import App from "./app";
import NextPageReaction from "./reactions/next-page-reaction";
import PreviousPageReaction from "./reactions/previous-page-reaction";

// Load environment variables from ./.env
dotenv.config();

// Register db client
const pgClient = new PgClient({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.ENVIRONMENT === 'prod' ? {rejectUnauthorized: false} : false
});
container.registerInstance("pgClient", pgClient);

// Register discord client
const discordClient = new DiscordClient({partials: ["REACTION"]});
container.registerInstance("discordClient", discordClient);

// Register commands
container.register("commands", {
    useValue: [
        container.resolve(LetsPlayCommand),
        container.resolve(RegisterSteamIdCommand)
    ]
});
container.registerInstance("defaultCommand", container.resolve(HelpCommand));

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
process.on("exit", () => process.stdout.write('Good bye'));

// Start the application
const app = container.resolve(App);
app.run();
