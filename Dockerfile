# Build stage
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /usr/src/app

# Use 'serve' to serve the static files
RUN npm install -g serve

COPY --from=builder /usr/src/app .

EXPOSE 5173

CMD ["serve", "-s", "public", "-l", "5173"]
#FROM node:20-alpine
#WORKDIR /usr/src/app
#COPY package*.json ./
#RUN npm install
#COPY . .
#EXPOSE 5173
#CMD ["npm", "run", "dev"]
