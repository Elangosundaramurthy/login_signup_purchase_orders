#!/bin/bash

echo "pull new changes....."
git pull origin master

echo "stop docker master"
docker stop da-analytics

echo "remove docker master"
docker rm da-analytics

echo "build master docker"
docker build -t da-analytics .


echo "run docker master"
docker run -d -p 3000:3000 --name da-analytics da-analytics