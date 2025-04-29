FROM node:20-alpine

WORKDIR /app

# Copy package files first to leverage Docker caching
COPY package.json ./

# Use npm install instead of npm ci since there's no package-lock.json
RUN npm install --verbose

# Then copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Set production environment
ENV NODE_ENV=production

# Expose the correct port (Remix typically uses 3000)
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]