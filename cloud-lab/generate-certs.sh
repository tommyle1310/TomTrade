#!/bin/bash

# Create certs directory
mkdir -p nginx/certs

# Generate self-signed certificate for tomtrade.local
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx/certs/selfsigned.key -out nginx/certs/selfsigned.crt -subj "/C=US/ST=State/L=City/O=TomTrade/CN=tomtrade.local"

echo "SSL certificates generated successfully!"
echo "Add this to your hosts file (C:\Windows\System32\drivers\etc\hosts):"
echo "127.0.0.1 tomtrade.local"