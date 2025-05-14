FROM node:22-alpine

WORKDIR /app

RUN npm i yarn

COPY package.json .

RUN yarn 

COPY . .

EXPOSE 3005

CMD [ "npm","start" ]
