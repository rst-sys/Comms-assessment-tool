# A portable image, so the app is not tied to one hosting company.
# Render does not need this (it reads render.yaml); Fly, Railway and most
# others can use it.
FROM node:22-slim

WORKDIR /app

# Install dependencies first so this layer is cached between builds.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV ACR_SERVE_STATIC=1
ENV PORT=8787
EXPOSE 8787

CMD ["npm", "start"]
