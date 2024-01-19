docker to ecr

build docker image
build -t <name of the image> <path to the dockerfile>

docker image ls (see all docker images)

docker and ecr login
aws ecr get-login-password --profile <profile name> --region <region of the ecr> | docker login --username AWS --password-stdin <ECR URI>

tag the image
docker tag <name of the docker image> <ECR URI>

push image to ecr
docker push <ECR URI>

## EC2 - pull image

policies to give it permission to the ecr
aws credentials set on ec2
docker installed and running

aws ecr get-login-password --region <region> --profile <profile_name> | docker login --username AWS --password-stdin <ECR_URI>
