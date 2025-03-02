FROM node:23.1.0 as build
COPY . /app
WORKDIR /app
RUN yarn install
RUN yarn build

FROM build
COPY --from=build /app/dist /app
WORKDIR /app

ENTRYPOINT ["node", "index.js"]
