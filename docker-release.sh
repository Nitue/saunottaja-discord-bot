#!/bin/bash
set -e

VERSION=$1

help() {
  echo "This script will build the Saunottaja Docker image (AMD64, ARM64) and push it to the repository."
  echo "Usage: ./docker-release.sh <version>"
  echo "Example: ./docker-release.sh 1.2"
}

if [[ -z "$VERSION" ]]
then
  help
  exit 1
fi

echo "Version $VERSION will be released. Proceed? (y/N)"
read -r DO_RELEASE

if [[ ! $DO_RELEASE =~ ^[Yy]$ ]]
then
  echo "Version was not released"
  exit 0
fi

docker login
docker buildx build --push --platform linux/arm64,linux/amd64 --tag nitue/saunottaja:latest --tag nitue/saunottaja:$VERSION .

echo "Release done!"