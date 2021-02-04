# Saunottaja Discord Bot

## Requirements

* Node 14.15.2 (or later)
* Docker, Docker Compose (recommended)

## Setup

Install dependencies:

    npm install

Launch database instance:

    docker-compose up -d

Create `.env` file and set values like in the `.env.example` file.

## Running

Build:

    npm run build

Run compiled JavaScript:

    npm run start


## Development

Run compiler in watch mode for immediate compiling when files change:

    npm run watch
