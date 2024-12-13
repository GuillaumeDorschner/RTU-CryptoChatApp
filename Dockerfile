FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm add concurrently
RUN pnpm install

COPY client ./client
COPY server ./server

RUN pnpm install --filter "./client..."
RUN pnpm install --filter "./server..."

EXPOSE 80 3000 3001

CMD ["pnpm", "run", "dev"]
