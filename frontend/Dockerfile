FROM node:18-alpine AS builder
WORKDIR /app

# Allow build-time injection of the Vite env var
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY package.json package-lock.json vite.config.ts index.html ./
COPY src ./src

# Build the app — Vite will pick up VITE_API_URL from the environment
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Optional: custom nginx config can be added here
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
