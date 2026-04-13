#!/bin/sh
# Seed MinIO/Cellar avec des fichiers de démonstration
# Utilisé par le conteneur minio-init dans docker-compose

set -e

ALIAS="local"
BUCKET="pipou-resources"

echo "⏳ Attente MinIO..."
sleep 3
mc alias set $ALIAS http://minio:9000 minioadmin minioadmin

echo "📦 Création du bucket..."
mc mb --ignore-existing $ALIAS/$BUCKET
mc anonymous set download $ALIAS/$BUCKET

# --- Thumbnails de démonstration (images JPG) ---
for f in /seed-images/*.jpg; do
  [ -f "$f" ] || continue
  name=$(basename "$f")
  mc cp "$f" $ALIAS/$BUCKET/thumbnails/$name
  echo "✅ thumbnails/$name"
done

# --- Fichier PDF de démonstration ---
echo '%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj
4 0 obj<</Length 44>>stream
BT /F1 24 Tf 100 700 Td (Cours PDF demo) Tj ET
endstream endobj
xref
0 5
trailer<</Size 5/Root 1 0 R>>
startxref 0
%%EOF' | mc pipe $ALIAS/$BUCKET/seed-cours-droits-numeriques.pdf
echo "✅ seed-cours-droits-numeriques.pdf"

echo ""
echo "🎉 Seed S3 terminé — fichiers disponibles :"
mc ls $ALIAS/$BUCKET/ --recursive
