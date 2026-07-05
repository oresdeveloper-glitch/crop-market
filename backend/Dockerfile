FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
