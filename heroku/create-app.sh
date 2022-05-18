#!/bin/bash
set -e

APP_NAME=$1
APP_REGION=$2
APP_REMOTE=$3

help() {
  echo "This script will help you launch Saunottaja on Heroku. Run the script like instructed below and follow the instruction while running."
  echo "Usage: ./create-app.sh <your-application-name> <heroku-region> <remote-name>"
  echo "Example: ./create-app.sh my-saunottaja-instance eu heroku-staging"
}

# Check if all needed parameters are given
if [[ -z "$APP_NAME" || -z "$APP_REGION" || -z "$APP_REMOTE" ]]
then
  help
  exit 1
fi

echo "Saunottaja will be created as '$APP_NAME' on '$APP_REGION' region. Git remote will be called '$APP_REMOTE'."

# Request bot token and steam api key
printf "Input your Discord bot token: "
read -s DISCORD_BOT_TOKEN

echo ""

printf "Input your Discord application id: "
read -s DISCORD_APPLICATION_ID

echo ""

printf "Input your Steam API key: "
read -s STEAM_WEB_API_KEY

# Create application, addons and configure
heroku apps:create "$APP_NAME" --region "$APP_REGION" --addons heroku-postgresql:hobby-dev --remote "$APP_REMOTE"
heroku stack:set container --app "$APP_NAME"
heroku config:set DATABASE_SSL=yes BOT_LANGUAGE=en DISCORD_BOT_TOKEN=$DISCORD_BOT_TOKEN STEAM_WEB_API_KEY=$STEAM_WEB_API_KEY DISCORD_APPLICATION_ID=$DISCORD_APPLICATION_ID --app "$APP_NAME"

# Deploy the application
GIT_BRANCH=$(git branch --show-current)
git push "$APP_REMOTE" "$GIT_BRANCH:master"
heroku ps:scale worker=1 --app "$APP_NAME"

echo "Done. You can delete the application by running: heroku apps:destroy --app $APP_NAME"

exit 0