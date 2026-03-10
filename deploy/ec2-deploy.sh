#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/ubuntu/career-preparation-backend}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
NODE_ENV="${NODE_ENV:-production}"
PM2_APP_NAME="${PM2_APP_NAME:-backend}"

echo "Starting EC2 deploy"
echo "APP_DIR=${APP_DIR}"
echo "DEPLOY_BRANCH=${DEPLOY_BRANCH}"

if [[ ! -d "${APP_DIR}" ]]; then
  echo "APP_DIR does not exist: ${APP_DIR}" >&2
  exit 1
fi

cd "${APP_DIR}"

if [[ ! -d ".git" ]]; then
  echo "APP_DIR is not a git repository: ${APP_DIR}" >&2
  exit 1
fi

git fetch --all --prune
git checkout "${DEPLOY_BRANCH}"
git pull --ff-only origin "${DEPLOY_BRANCH}"

export NODE_ENV

npm ci
npm run build
npx prisma migrate deploy

pm2 start ecosystem.config.cjs --only "${PM2_APP_NAME}" --update-env || \
  pm2 restart "${PM2_APP_NAME}" --update-env
pm2 save

echo "Deploy completed successfully"
