#!/bin/bash

PR_NUMBER=$1
PUBLIC_IP=$2

DIR="/app/pr-envs/pr-$PR_NUMBER"
PORT="50$PR_NUMBER"

echo "Deploying PR $PR_NUMBER..."

mkdir -p $DIR/frontend
cd $DIR

cp /app/templates/docker-compose.pr.yml docker-compose.yml

export PR_NUMBER=$PR_NUMBER

docker compose pull
docker compose -p pr-$PR_NUMBER up -d

# Create nginx config
CONF="/etc/nginx/conf.d/pr-$PR_NUMBER.conf"

sudo bash -c "cat > $CONF" <<EOF
server {
    listen 80;
    server_name pr_$PR_NUMBER.$PUBLIC_IP.nip.io;

    root $DIR/frontend;
    index index.html;

    location / {
        try_files \$uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:$PORT/;

        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo nginx -s reload

echo "PR $PR_NUMBER deployed on port $PORT"