# Step 1: Build the Angular app
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the code and build
COPY . .
RUN npm run build --configuration=production

# Step 2: Serve it with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/skaie_app/browser/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80