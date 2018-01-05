FROM node:alpine
LABEL Maintainer="Andre Alves Garzia <andre@andregarzia.com" \
      Description="Lightweight container with NodeJS based on Alpine Linux 3.6."

RUN apk --no-cache add git

RUN mkdir -p /usr/src/app
COPY package.json /usr/src/app
WORKDIR /usr/src/app
RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]
