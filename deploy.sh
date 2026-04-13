#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Build & deploy a2ui-react-app to Google Cloud Run
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Config (edit these) ───────────────────────────────────────────────────────
PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-myaiproject-492813}"
REGION="${CLOUD_RUN_REGION:-us-central1}"          # Mumbai — closest to Bangalore
SERVICE_NAME="a2ui-react-app"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "╔════════════════════════════════════════════════════════╗"
echo "║   A2UI React App — Cloud Run Deployment                ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "  Project  : ${PROJECT_ID}"
echo "  Region   : ${REGION}"
echo "  Service  : ${SERVICE_NAME}"
echo "  Image    : ${IMAGE_NAME}"
echo ""

# ── Prerequisites check ───────────────────────────────────────────────────────
command -v gcloud &>/dev/null || { echo "❌  gcloud CLI not found. Install: https://cloud.google.com/sdk/docs/install"; exit 1; }
command -v docker &>/dev/null || { echo "❌  Docker not found. Install Docker Desktop."; exit 1; }

# ── Authenticate (skip if already authed) ─────────────────────────────────────
echo "▶  Authenticating with Google Cloud..."
gcloud auth configure-docker --quiet
gcloud config set project "${PROJECT_ID}" --quiet

# ── Enable required APIs ──────────────────────────────────────────────────────
echo "▶  Enabling Cloud Run & Container Registry APIs..."
gcloud services enable run.googleapis.com containerregistry.googleapis.com --quiet

# ── Build & push Docker image ─────────────────────────────────────────────────
echo "▶  Building Docker image..."
docker build --platform linux/amd64 -t "${IMAGE_NAME}:latest" .

echo "▶  Pushing image to GCR..."
docker push "${IMAGE_NAME}:latest"

# ── Deploy to Cloud Run ───────────────────────────────────────────────────────
echo "▶  Deploying to Cloud Run (region: ${REGION})..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_NAME}:latest" \
  --platform managed \
  --region "${REGION}" \
  --port 8080 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --cpu 1 \
  --memory 256Mi \
  --timeout 60s \
  --set-env-vars "NODE_ENV=production" \
  --quiet

# ── Get URL ───────────────────────────────────────────────────────────────────
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --platform managed \
  --region "${REGION}" \
  --format "value(status.url)")

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   ✅  Deployment complete!                             ║"
echo "╠════════════════════════════════════════════════════════╣"
echo "║   URL: ${SERVICE_URL}"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
