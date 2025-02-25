FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run test
RUN npm run build
EXPOSE 83
CMD ["npm", "run", "start"]
