FROM node:23.1.0 as build

COPY . /app
WORKDIR /app
RUN yarn install
RUN yarn build

ENTRYPOINT ["node", "dist/index.js"]
