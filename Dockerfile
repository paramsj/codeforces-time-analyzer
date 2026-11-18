FROM node:20-slim

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

CMD ["node", "index.js"]
