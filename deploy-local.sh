#!/bin/bash

echo "📦 Đóng gói source backend..."
cd backend
zip -r app.zip . -x "node_modules/*" -x "*.git*"
cd ..

echo "🚚 Copy app.zip vào container backend1..."
docker cp backend/app.zip local-ec2:/usr/src/app.zip

echo "📂 Giải nén trong container và restart app..."
docker exec local-ec2 sh -c "
  cd /usr/src && \
  unzip -o app.zip && \
  rm app.zip && \
  npm install && \
  npm run start:dev
"
