# Saunottaja Discord Bot

Saunottaja is a Discord bot which can find out what Steam games you and your friends could play together.

Currently the bot can:

1. find out what Steam games you can play with the tagged users. E.g. `@Saunottaja letsplay @You @YourFriend @YourAnotherFriend`
2. suggest a random game you can play with tagged users. E.g. `@Saunottaja letsplay random @You @YourFriend @YourAnotherFriend`

## Things to do

1. Add rest of the localization of messages
2. Find out games on Steam wishlists
3. Dockerize development environment completely
4. AWS CDK for AWS deployment (?)
5. Find out which Windows games are playable via SteamPlay on Linux
6. Add unit tests

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
