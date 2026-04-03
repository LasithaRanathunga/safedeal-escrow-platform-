#!/bin/bash

PR_NUMBER=$1
DIR="/app/pr-envs/pr-$PR_NUMBER"

echo "Deleting PR $PR_NUMBER..."

cd $DIR || exit

docker compose down -v
rm -rf $DIR

sudo rm -f /etc/nginx/conf.d/pr-$PR_NUMBER.conf
sudo nginx -s reload

echo "PR $PR_NUMBER deleted!"