FROM node:lts-alpine3.21

WORKDIR /app

COPY package*.json ./

RUN npm install pnpm -g

RUN pnpm install

RUN pnpm install nodemon

RUN pnpm install ts-node

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
