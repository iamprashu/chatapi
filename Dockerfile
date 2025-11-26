FROM node:lts-alpine3.21

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install pnpm -g

RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
