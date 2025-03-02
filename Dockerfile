FROM node:23-alpine

COPY . /app
WORKDIR /app
RUN yarn install
RUN yarn build

EXPOSE 3000

CMD ["node", "dist/index.js"]
