# Container image with the b4a cli already installed
FROM back4app/b4a_cli:latest

# Copies the entrypoint file from the action repository to the filesystem path `/` of the container
COPY entrypoint.sh /entrypoint.sh

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["/entrypoint.sh"]
