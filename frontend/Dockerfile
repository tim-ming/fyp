FROM node:20.11

WORKDIR /app

COPY . .

RUN npm install

# Expose the port Expo uses
EXPOSE 8081

# Create a startup script
RUN echo '#!/bin/sh\n\
if [ -n "$EXPO_USERNAME" ] && [ -n "$EXPO_PASSWORD" ]; then\n\
  npx expo login -u $EXPO_USERNAME -p $EXPO_PASSWORD\n\
  npx expo start --tunnel\n\
else\n\
  npx expo start\n\
fi' > /app/start.sh && chmod +x /app/start.sh

# Set the startup script as the entrypoint
ENTRYPOINT ["/app/start.sh"]
