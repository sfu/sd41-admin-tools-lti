FROM node:14-alpine

WORKDIR /usr/src/app

RUN apk update && \
    apk add --no-cache git util-linux 
copy package*.json ./
RUN yarn
COPY . .
EXPOSE 3000
CMD ["yarn", "start"]
