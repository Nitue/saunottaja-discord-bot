# Saunottaja Discord Bot

Saunottaja is a Discord bot which can find out what Steam games you and your friends could play together.

![Saunottaja letsplay command](doc/saunottaja-discord-bot.png)

## What can it do?

Saunottaja uses Discord's slash commands. Type `/` on your server and see the commands:

* `/letsplay` to find out what games you could play with your friends right now.
* `/letsbuy` to find out what games you could almost play with your friends. Maybe a game is missing from only one of you?
* `/suggest` when you have too many choices. Saunottaja will decide for you.
* `/steamid` to register your Steam ID with the bot. This is required for every user who wants to participate.

## Known issues and limitations

1. Steam API has a limit of 100000 requests per day. 
2. Some APIs also have a limit for frequent requests which renews in few minutes after `HTTP 429` is given. The bot may be sometimes unable to find information about games.
   
For these reasons, the **bot is currently only suitable for small servers where constant usage is not needed**. For this reason this bot is not available as a public bot. 

## Possible upcoming features

1. Cache Steam API responses for a while to help with Steam API limitations.
2. Include information about Linux support (e.g. ProtonDB rating)

# How to get to my server?

Due to the limitations, the bot is not available as public bot. This means you need to run a Saunottaja instance yourself and invite a private bot.

Saunottaja is available as a [Docker image](https://hub.docker.com/r/nitue/saunottaja) which can be used in combination of a database instance. This repository comes with Docker Compose configuration to run Saunottaja with a PostgreSQL instance.

You can use guides below to run Saunottaja:

- On any machine with Docker
- On Heroku cloud application platform

## Discord setup

These steps are required for running the bot on any environment.

1. Create an application on the [Discord Developer Portal](https://discord.com/developers/applications) and add a bot to your application. Take a note of your bot token and application id.
2. Invite the bot to your server: `https://discord.com/oauth2/authorize?client_id=YOUR_APPLICATION_ID&permissions=10304&scope=bot%20applications.commands` where `YOUR_APPLICATION_ID` is replaced with your actual application id.
3. Get your [Steam API key](https://steamcommunity.com/dev/apikey).

> Note: API keys and tokens are private information, and you should never share these with anyone.

## Running on any machine

For development, see [Development setup](#development-setup).

1. Make sure you have done [Discord setup](#discord-setup).
2. Install [Docker](https://www.docker.com/).
3. Create `.env.prod` file and set values like in the `.env.example` file. Paste your Steam API key, Discord application id and Discord bot token here.
4. Run deployment script to deploy desired image version. For example:
   ```shell
   $ ./docker-deploy.sh latest
   ```

If you wish to deploy to remote machine from your machine, you can create a docker context and use the deployment script to deploy:
```shell
$ ./docker-deploy.sh latest my-context-name
```

## Running on Heroku

1. Make sure you have done [Discord setup](#discord-setup).
2. You can run the help script to create Heroku application with required addons and configuration, and deploy the bot. Run following commands and follow the instructions:

    ```shell
    $ heroku login
    $ ./heroku/create-app.sh
    ```

## Development setup

1. Make sure you have done [Discord setup](#discord-setup).
2. Install [Docker](https://www.docker.com/).
3. Install Node 14.x (or later)
4. Create `.env` file and set values like in the `.env.example` file. Paste your Steam API key, Discord application id and Discord bot token here.
5. Run the development environment with:

    ```shell
    $ docker-compose up -d
    ```

    Editing files in `src` folder should trigger building and restarting of the application automatically.

6. For intellisense to work in your editor, you need to install node modules locally:

    ```shell
    $ npm install
    ```

