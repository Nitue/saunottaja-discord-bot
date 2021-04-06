# Saunottaja Discord Bot

Saunottaja is a Discord bot which can find out what Steam games you and your friends could play together.

![Saunottaja letsplay command](doc/saunottaja-discord-bot.png)

Currently the bot can:

1. find out what Steam games you can play with the tagged users. E.g. `@Saunottaja letsplay @You @YourFriend @YourAnotherFriend`. Results are paged and can be browsed with arrow reactions on the message.
2. suggest a random game you can play with tagged users. E.g. `@Saunottaja letsplay random @You @YourFriend @YourAnotherFriend`

## Things to do

1. Find out games on Steam wishlists
2. Dockerize development environment completely
3. AWS CDK for AWS deployment (?)
4. Find out which Windows games are playable via SteamPlay on Linux
5. Add unit tests

## Requirements

* Node 14.15.2 (or later)
* Docker, Docker Compose
* Steam API key

## Development setup

Install dependencies:

    npm install

Launch database instance:

    docker-compose up -d

Create `.env` file and set values like in the `.env.example` file. Find out your tokens from Steam and Discord.

Compile transparently and run:

    npm run start

## Building

For example, to build for distribution:

    npm run build

Output is located in `./dist`
