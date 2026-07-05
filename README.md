# BITY

BITY is a full-stack agriculture platform with a React frontend, an Express backend, Prisma, and IoT integration.

## Project structure
- frontend: Vite + React + TypeScript
- backend: Express + TypeScript + Prisma
- esp32-cam, esp32-wokwi: IoT firmware
- mosquitto: MQTT broker config

## Local development
### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

## Environment variables
Create a backend/.env file with values such as:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-me"
PORT=5000
```

Create a frontend/.env file if you want to point the UI at a deployed API:
```env
VITE_API_URL=https://your-backend-url/api
```

## Deployment
This repository includes a GitHub Actions workflow for building the frontend automatically on push.
