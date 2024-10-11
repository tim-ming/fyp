FROM node:20.11

WORKDIR /app

COPY . .

RUN npm install

# Install expo-cli globally
RUN npm install -g expo-cli

# Expose the port Expo uses
EXPOSE 8081

# Create a startup script
RUN echo '#!/bin/sh\n\
if [ -n "$EXPO_USERNAME" ] && [ -n "$EXPO_PASSWORD" ]; then\n\
  expo login -u $EXPO_USERNAME -p $EXPO_PASSWORD\n\
fi\n\
npx expo start\n' > /app/start.sh && chmod +x /app/start.sh

# Set the startup script as the entrypoint
ENTRYPOINT ["/app/start.sh"]