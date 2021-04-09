# build
FROM node:lts-alpine as build

WORKDIR /app

COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn build

FROM fraoustin/fancyindex as production
COPY .docker/conf.d /etc/nginx/conf.d
COPY --from=build /app/public /srv/public
COPY .docker/.htpasswd /etc/nginx/.htpasswd

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
