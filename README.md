# Saunottaja Discord Bot

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
