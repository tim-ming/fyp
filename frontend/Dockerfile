# frontend/Dockerfile
FROM node:20.11

WORKDIR /app

COPY . .

RUN npm install

# Install expo-cli globally
RUN npm install -g expo-cli

# Set environment variables for Expo credentials
ENV EXPO_USERNAME=""
ENV EXPO_PASSWORD=""

# Expose the port Expo uses
EXPOSE 8081

# Login to Expo and start the app
CMD expo login -u $EXPO_USERNAME -p $EXPO_PASSWORD && npx expo start