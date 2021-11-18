# Saunottaja Discord Bot

Saunottaja is a Discord bot which can find out what Steam games you and your friends could play together.

![Saunottaja letsplay command](doc/saunottaja-discord-bot.png)

# What can it do?

Saunottaja uses Discord's slash commands. Type `/` on your server and see the commands:

* `/letsplay` to find out what games you could play with your friends right now.
* `/letsbuy` to find out what games you could almost play with your friends. Maybe a game is missing from only one of you?
* `/suggest` when you have too many choices. Saunottaja will decide for you.
* `/steamid` to register your Steam ID with the bot. This is required for every user who wants to participate.

# Things to do

1. Find out games on Steam wishlists
2. AWS CDK for AWS deployment (?)
3. Find out which Windows games are playable via SteamPlay on Linux
4. Add unit tests

# Known issues and limitations

1. Steam API has a limit of 100000 requests per day. 
2. Some APIs also have a limit for frequent requests which renews in few minutes after `HTTP 429` is given. The bot may be sometimes unable to find information about games.
   
For these reasons, the **bot is currently only suitable for small servers where constant usage is not needed**. Additionally, usage on multiple servers is not recommended. 

# How to use?

Instructions in "Prerequisites" are needed for running the bot and development.

## Prerequisites

1. Create an application on the [Discord Developer Portal](https://discord.com/developers/applications) and add a bot to your application. Take a note of your bot token and application id.
2. Invite your bot to your server: `https://discord.com/oauth2/authorize?client_id=YOUR_APPLICATION_ID&permissions=2112&scope=bot%20applications.commands` where `YOUR_APPLICATION_ID` is replaced with your actual application id.
3. Get your [Steam API key](https://steamcommunity.com/dev/apikey).

Note: API keys and tokens are private information, and you should never share these with anyone.

Next steps are only needed when running locally or for development.

4. Install [Docker](https://www.docker.com/).
5. Install Node 14.x (or later). Not *required* for running but recommended when developing.

## Running locally and development

Create `.env` file and set values like in the `.env.example` file. Paste your Steam API key and Discord bot token here.

Run the application with:

```shell
$ docker-compose --profile prod up -d
```

For development, run the application with `dev` profile instead:

```shell
$ docker-compose --profile dev up -d
```

When running in `dev` profile, editing files in `src` folder should trigger building and restarting of the application automatically.

For intellisense to work in your editor, node modules are needed locally:

```shell
$ npm install
```

## Running on Heroku

You can run help script to create Heroku application with required addons and configuration, and deploy the bot. Run following commands and follow the instructions:

```shell
$ heroku login
$ ./heroku/create-app.sh
```