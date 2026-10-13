FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run check

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY --from=build /app/server.ts ./server.ts
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
