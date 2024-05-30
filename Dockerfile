# Use the official Node.js image as a base image
FROM node:20.14

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files into the working directory
COPY package*.json ./
COPY tsconfig.json ./
COPY app-env.sh ./

# Run the app-env.sh script to set environment variables
RUN /bin/bash -c "source app-env.sh"

# Install the dependencies
RUN npm install

# Copy the rest of the application code into the working directory
COPY . .

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Create a startup script
RUN echo '#!/bin/bash' > /usr/src/app/start.sh \
    && echo 'npm run configure:db:prod --name=init' >> /usr/src/app/start.sh \
    && echo 'npm run start:prod' >> /usr/src/app/start.sh \
    && chmod +x /usr/src/app/start.sh

# Use the startup script as the container's entry point
CMD [ "/usr/src/app/start.sh" ]
