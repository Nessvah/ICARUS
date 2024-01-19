# THIS DOCKERFILE IS NOT ADAPTED TO PRODUCTION

# Set node version
FROM node:20.10-bookworm

# set env variables
ENV PORT=5001
ENV JWT_SECRET=cookiesfornow
ENV DB_USER=admin
ENV DB_PWD=admin123
ENV DB_HOST=icarus-sql-server.cr6kusygg978.eu-north-1.rds.amazonaws.com
ENV DB_DATABASE=Icarus

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
