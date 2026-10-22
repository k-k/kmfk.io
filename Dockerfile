FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY content ./content
COPY public ./public

USER node
ENV PORT=8080
EXPOSE 8080
CMD ["node", "src/server.js"]
