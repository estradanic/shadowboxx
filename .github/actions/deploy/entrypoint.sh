#!/bin/sh -l

b4a configure accountkey $2

echo "Hello! Your AppID is: $1"
echo "Your account key is: $2"
echo "Your email is: $3"
