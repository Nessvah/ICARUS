# THIS DOCKERFILE IS NOT ADAPTED TO PRODUCTION

# Set node version
FROM node:20.10-bookworm

# create working directory in container
WORKDIR /usr/src/app

# copy the packages files to there
COPY package*.json ./

# install its dependencies
# run npm ci -> continuous integration for production
RUN npm install
RUN npm install -g nodemon


# now we need to copy all the files into
# our container so we can run the app
# . . copy everything from this current directory

COPY . .

# Expose port 5001

EXPOSE 5001

# -L will allow for nodemon to reload
# --inspect-brk=0.0.0.0 is needed for
# debugging containerized apps
CMD ["npm", "run", "dev"]
