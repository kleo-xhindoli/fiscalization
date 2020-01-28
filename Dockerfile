FROM node:10.16

EXPOSE 3001

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

RUN mkdir /app
WORKDIR /app
ADD package.json yarn.lock /app/
RUN yarn
ADD . /app

CMD ["yarn", "start"]
