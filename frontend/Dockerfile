# frontend/Dockerfile
FROM node:20.11

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 8081

CMD ["npx", "expo", "start"]
