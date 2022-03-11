FROM node:14.15.5-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN apk add --no-cache --virtual .gyp python3 make g++ 
RUN apk add --no-cache ffmpeg
#RUN npm install ffmpeg-static
RUN npm install
RUN apk del .gyp

COPY --chown=node . . 

USER node
CMD [ "node", "index.js" ]
