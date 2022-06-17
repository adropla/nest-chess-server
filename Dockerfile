FROM node:16-alpine3.14

WORKDIR /app

COPY package*.json ./

RUN npm install --force

COPY . .

COPY ./dist ./dist

CMD ["npm", "run", "start:dev"]