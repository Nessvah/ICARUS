# THIS DOCKERFILE IS NOT ADAPTED TO PRODUCTION

# Set node version
FROM node:20.10-bookworm

# set env variables
ENV PORT=5001
ENV JWT_SECRET=cookiesfornow
ENV MYSQL_HOST=ec2-16-171-244-15.eu-north-1.compute.amazonaws.com
ENV MYSQL_USER=root
ENV MYSQL_PWD=admin123
ENV MYSQL_DATABASE=icarus
ENV MYSQL_PORT=3306

ENV SECRET_NAME=icarus-secrets

# create working directory in container
WORKDIR /usr/src

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
CMD ["npm","run", "dev"]
