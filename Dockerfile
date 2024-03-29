ARG ARCH=""

FROM node:16.18.1 AS build
WORKDIR /saunottaja
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src/ ./src
RUN npm run build

FROM ${ARCH}node:16.18.1-alpine AS release
WORKDIR /saunottaja
COPY --from=build /saunottaja/dist .
CMD ["node", "main.js"]