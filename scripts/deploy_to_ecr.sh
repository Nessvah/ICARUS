#!/bin/bash

DOCKER_IMAGE_NAME="icarus-api"
ECR_REPO_URI="352074856451.dkr.ecr.eu-north-1.amazonaws.com/icarus-fast-api"
AWS_REGION="eu-north-1"
AWS_PROFILE_NAME="icarus-dev"
DOCKERFILE_PATH="../src/Dockerfile"


#Build first the docker image
docker build -t $DOCKER_IMAGE_NAME -f $DOCKERFILE_PATH ../src

#Tag the docker image
docker tag $DOCKER_IMAGE_NAME:latest $ECR_REPO_URI:latest

#Login to AWS ECR and push the docker image there
aws ecr get-login-password --profile $AWS_PROFILE_NAME --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO_URI
docker push $ECR_REPO_URI:latest
