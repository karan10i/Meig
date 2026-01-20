FROM node:24-bullseye-slim

WORKDIR /app

# Install Python and system build deps for Python packages
RUN apt-get update && \
		apt-get install -y --no-install-recommends \
			python3 python3-pip python3-venv build-essential libssl-dev libffi-dev ca-certificates curl bash && \
		rm -rf /var/lib/apt/lists/*

# Copy package files and install Node deps
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Install Python dependencies; try requirements.txt if present
RUN if [ -f requirements.txt ]; then pip3 install --no-cache-dir -r requirements.txt; else pip3 install --no-cache-dir flask pymongo python-dotenv; fi

# Make start script executable
RUN chmod +x start.sh || true

# Expose ports
EXPOSE 3000 5001

# Start both services
CMD ["./start.sh"]
