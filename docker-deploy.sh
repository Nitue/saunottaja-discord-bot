#!/bin/bash
set -e

VERSION=$1
DOCKER_CONTEXT=$2

SCRIPT_DIR=$(dirname "$0")
POSTGRES_ENV_FILE="$SCRIPT_DIR/.env.postgres.prod"

help() {
  echo "This script will deploy Saunottaja. Leaving <context> empty will deploy locally. Enter name of remote context if configured."
  echo "This script will also create configuration for the database if it does not exist."
  echo "Usage: ./docker-deploy.sh <version> [<context>]"
  echo "Example: ./docker-deploy.sh latest"
  echo "Example: ./docker-deploy.sh 1.0 raspi"
}

setup_postgres() {
  touch "$POSTGRES_ENV_FILE"
  POSTGRES_PASSWORD=$(openssl rand -hex 48)
  printf "POSTGRES_USER=saunottaja\nPOSTGRES_DB=saunottaja\nPOSTGRES_PASSWORD=$POSTGRES_PASSWORD" > "$POSTGRES_ENV_FILE"
  echo "Automatically created configuration for database: $POSTGRES_ENV_FILE"
  sed -i "s|DATABASE_URL=.*$|DATABASE_URL=postgres://saunottaja:$POSTGRES_PASSWORD@postgres/saunottaja|gm" "$SCRIPT_DIR/.env.prod"
  echo "Automatically configured to use the database. To automatically configure again, remove $POSTGRES_ENV_FILE file."
  echo ""
}

if [[ -z "$VERSION" ]]
then
  help
  exit 1
fi

if [[ -z "$DOCKER_CONTEXT" ]]
then
  DOCKER_CONTEXT="default"
fi

# Setup postgres e.g. when running first time
if [ ! -f "$POSTGRES_ENV_FILE" ]
then
  setup_postgres
fi

echo "Version '$VERSION' will be deployed to '$DOCKER_CONTEXT' context. Database configuration will be used from '.env.postgres.prod'."
echo "Proceed? (y/N)"
read -r DEPLOY

if [[ ! $DEPLOY =~ ^[Yy]$ ]]
then
  echo "Version was not deployed"
  exit 2
fi

echo "Deploying..."

SAUNOTTAJA_VERSION=$VERSION docker-compose --context "$DOCKER_CONTEXT" -f docker-compose.yml -f docker-compose.prod.yml up -d
echo "Deployment done!"