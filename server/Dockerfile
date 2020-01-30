FROM node:13

WORKDIR /var/auxility/fcm-node-server

COPY . ./

RUN npm install

#RUN npm install pm2 -g

RUN npm run build

ENTRYPOINT ["npm", "run", "start"]