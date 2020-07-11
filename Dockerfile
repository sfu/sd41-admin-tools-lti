FROM node:14-alpine

WORKDIR /usr/src/app

RUN apk update && \
    apk add --no-cache git util-linux 
COPY package*.json ./
RUN yarn || yarn --network-concurrency 1
COPY . .
EXPOSE 3000
CMD ["yarn", "start"]
