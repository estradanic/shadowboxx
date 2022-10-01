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

apt install tree -y

tree -L 3 -d /github

printf $ACCOUNT_KEY | b4a configure accountkey
