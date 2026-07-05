FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma/schema.prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production
ENV DATABASE_URL="file:./dev.db"

CMD ["sh", "-c", "npx prisma db push && node prisma/seed.cjs && node dist/index.js"]
