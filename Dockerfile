### STAGE 1: Build ###
FROM node:14.15.3-alpine3.12 AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "node", "index.js" ]