FROM node:16-alpine AS build
WORKDIR /saunottaja
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src/ ./src
RUN npm run build

FROM node:16-alpine AS release
WORKDIR /saunottaja
COPY --from=build /saunottaja/dist .
CMD ["node", "main.js"]