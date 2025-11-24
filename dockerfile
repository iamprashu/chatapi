FROM node:lts-alpine3.21

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

COPY package*.json ./

RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
