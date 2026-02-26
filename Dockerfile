# Backend VitalMove - Node 22
# Usar este Dockerfile evita el buildpack de Node y el error 403 heroku-nodebin en Digital Ocean
FROM node:22-alpine

WORKDIR /app

# Dependencias de producción (backend sin build)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Código de la app
COPY . .

# App Platform inyecta PORT en runtime
EXPOSE 8080

CMD ["node", "./bin/www"]
