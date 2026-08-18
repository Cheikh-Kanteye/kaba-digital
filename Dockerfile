FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=production

COPY . .

RUN npm install -g corepack@latest \
  && corepack pnpm install \
  && corepack pnpm run build \
  && corepack pnpm prune --prod

EXPOSE 3000

CMD ["node", "dist/index.js"]

