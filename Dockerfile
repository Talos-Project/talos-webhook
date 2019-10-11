FROM node:10.13-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY package.json .
COPY package-lock.json .
RUN npm i --silent --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD npm start