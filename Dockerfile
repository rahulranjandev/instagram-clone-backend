# STAGE: Builder
FROM node:22-alpine AS builder

WORKDIR /builder

# Copy both files so npm ci can use the lockfile for a reproducible install
COPY package.json package-lock.json ./
RUN npm ci

# Copy source after deps are installed (better layer caching)
COPY . .

RUN npm run build


# STAGE: Production
FROM node:22-alpine

# node:22-alpine already ships Node — no need to apk add nodejs

ENV NODE_ENV=production

USER node

WORKDIR /home/app

COPY --chown=node:node package.json package-lock.json ./

# --omit=dev replaces the deprecated --only=production flag (npm v9+)
RUN npm ci --omit=dev

COPY --from=builder --chown=node:node /builder/dist ./dist

EXPOSE 3333
CMD ["node", "dist/app.js"]