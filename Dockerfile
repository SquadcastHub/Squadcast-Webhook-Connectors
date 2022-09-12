FROM node:16.15-alpine3.14

WORKDIR /app

COPY package.json .

RUN npm i

COPY . .

CMD ["npm", "run", "start"]
