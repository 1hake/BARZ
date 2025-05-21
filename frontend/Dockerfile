FROM node:18

WORKDIR /app

# COPY d'abord pour cache layer npm
COPY package.json package-lock.json* ./

# --- install clean ---
RUN rm -rf node_modules package-lock.json && npm install 

# puis le reste du projet
COPY . .



EXPOSE 3000

CMD ["npm", "run", "dev"]