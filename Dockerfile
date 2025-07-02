FROM ubuntu:20.04
RUN apt-get update
RUN apt-get -y upgrade
RUN apt-get install -y lib32stdc++6 curl
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash
RUN apt-get install -y nodejs
WORKDIR /server
COPY package.json /server
RUN npm i
COPY . .
CMD ["sh", "-c", "node update-config.js && npm start"]