#!/bin/sh -l

APP_ID=$1
ACCOUNT_KEY=$2
EMAIL=$3
APP_NAME=$4

if [ -z $APP_ID ]
then
  echo "appid is empty or not provided"
  exit 1
fi

if [ -z $ACCOUNT_KEY ]
then
  echo "accountkey is empty or not provided"
  exit 1
fi

if [ -z $EMAIL ]
then
  echo "email is empty or not provided"
  exit 1
fi

if [ -z $APP_NAME ]
then
  echo "appname is empty or not provided"
  exit 1
fi

cd /github/workspace/src

echo "Configuring account key"
printf $ACCOUNT_KEY | b4a configure accountkey

echo "Installing yarn"
apt update -y
DEBIAN_FRONTENT=noninteractive apt install -y --no-install-recommends npm
DEBIAN_FRONTENT=noninteractive apt install -y --no-install-recommends curl
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 16
nvm use 16
npm install -g yarn

echo "Creating folders for deployment"
mkdir ../public

echo "Deploying"
if [ $APP_NAME = "Shadowboxx" ]
then
  echo "Deploying to production"
  yarn deploy:prod
else
  echo "Deploying to devTest"
  yarn deploy
fi
echo "Deployed"
