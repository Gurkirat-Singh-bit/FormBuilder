# Backend Dockerfile
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
ENV PORT=5501
EXPOSE 5501
CMD ["npm", "start"]
