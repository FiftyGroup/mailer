FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install && npx tsc


CMD node build/index.js

EXPOSE 3000