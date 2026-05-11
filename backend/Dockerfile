FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

#Buka jalur port 5000
EXPOSE 5000

#Perintah untuk menyalakan aplikasi saat kontainer jalan
CMD ["node", "server.js"]
