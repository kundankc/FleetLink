FROM node:20-bullseye-slim as build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-bullseye-slim as runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=build /usr/src/app/dist ./dist
# use a tiny static server to serve the built assets
RUN npm install -g serve
EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]
