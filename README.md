# Saunottaja Discord Bot

Somewhat specific bot for a specific discord server.

Currently the bot can:

1. find out what Steam games you can play with the tagged users
2. suggest a random game you can play with tagged users

## Things to do

1. Add rest of the localization of messages
2. Find out games on Steam wishlists

## Requirements

* Node 14.15.2 (or later)
* Docker, Docker Compose (recommended)

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
