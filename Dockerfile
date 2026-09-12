FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json bun.lock ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=build /app/package.json /app/bun.lock ./
RUN npm install --omit=dev --no-audit --no-fund
COPY --from=build /app/server.js ./
COPY --from=build /app/server ./server
COPY --from=build /app/dist ./dist
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -fs http://127.0.0.1:3001/api/health || exit 1
CMD ["node", "server.js"]
