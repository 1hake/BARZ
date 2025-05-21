FROM node:21

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Generate Prisma client
RUN npx prisma generate

CMD ["npm", "run", "start"]