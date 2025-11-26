FROM node:lts-alpine3.21

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install pnpm -g

# install dependencies
RUN pnpm install

# copy source
COPY . .

# build TypeScript
RUN pnpm build

EXPOSE 3000

# run compiled JS, not dev mode
CMD ["node", "dist/index.js"]
