FROM node:18

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# AJOUTE CECI : génère Prisma depuis Docker avec le bon moteur binaire
RUN npx prisma generate

CMD ["npm", "run", "start"]