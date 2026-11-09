#!/usr/bin/env bash
set -euo pipefail

IMAGE_REGISTRY=registry.forge.apps.education.fr/jeanclaudelhote/math-alea-mc
IMAGE_TAG=node22-pw1.60-tex-2026-06

if [[ -z "$IMAGE_REGISTRY" ]]; then
  echo "Missing IMAGE_REGISTRY. Example:"
  echo "  IMAGE_REGISTRY=registry.forge.apps.education.fr/jeanclaudelhote/math-alea-mc ./docker/ci-pdf/build-and-push.sh"
  exit 1
fi

IMAGE="${IMAGE_REGISTRY}/ci/tex-node-playwright:${IMAGE_TAG}"

echo "Building ${IMAGE}"
docker build -f docker/ci-pdf/Dockerfile -t "${IMAGE}" .

echo "Pushing ${IMAGE}"
docker push "${IMAGE}"

echo "Done: ${IMAGE}"
