FROM node:boron

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY src/package.json .
# For npm@5 or later, copy package-lock.json as well
# COPY package.json package-lock.json ./

RUN npm install

# Bundle app source
COPY src/* ./

EXPOSE 8000
CMD [ "npm", "start" ]