FROM node:18-alpine

WORKDIR /app

# Install Python and pip
RUN apk add --no-cache python3 py3-pip bash

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Install Python dependencies
RUN pip install --no-cache-dir flask pymongo python-dotenv

# Copy application files
COPY . .

# Make start script executable
RUN chmod +x start.sh

# Expose both ports
EXPOSE 3000 5001

# Start both services
CMD ["./start.sh"]
