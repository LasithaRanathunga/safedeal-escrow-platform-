#!/bin/bash

PR_NUMBER=$1
DIR="/app/pr-envs/pr-$PR_NUMBER"
PORT="50$PR_NUMBER"

echo "Deploying PR $PR_NUMBER..."

mkdir -p $DIR/frontend
cd $DIR

cp /app/templates/docker-compose.pr.yml docker-compose.yml

export PR_NUMBER=$PR_NUMBER

docker compose pull
docker compose up -d

# Create nginx config
CONF="/etc/nginx/conf.d/pr-$PR_NUMBER.conf"

sudo bash -c "cat > $CONF" <<EOF
server {
    listen 80;
    server_name pr-$PR_NUMBER.yourdomain.com;

    root $DIR/frontend;
    index index.html;

    location / {
        try_files \$uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:$PORT;
    }
}
EOF

sudo nginx -s reload

echo "PR $PR_NUMBER deployed on port $PORT"