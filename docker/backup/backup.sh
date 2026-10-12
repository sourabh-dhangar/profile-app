#!/bin/bash
set -e

MONGO_HOST="${MONGO_HOST:-mongo}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_DB="${MONGO_DB:-myprofile}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_INTERVAL="${BACKUP_INTERVAL_SECONDS:-86400}" # Default: 24 hours (daily)
RETENTION_DAYS="${RETENTION_DAYS:-7}"

mkdir -p "$BACKUP_DIR"

echo "=========================================================="
echo "🛡️  MyProfile Automated MongoDB Backup Daemon Started"
echo "Target DB: $MONGO_DB on $MONGO_HOST:$MONGO_PORT"
echo "Backup Interval: ${BACKUP_INTERVAL}s | Retention: ${RETENTION_DAYS} days"
echo "=========================================================="

# Wait for MongoDB to become ready
echo "Waiting for MongoDB on $MONGO_HOST:$MONGO_PORT..."
until nc -z "$MONGO_HOST" "$MONGO_PORT"; do
    sleep 2
done
echo "MongoDB connection established."

while true; do
    TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/${MONGO_DB}_${TIMESTAMP}.gz"
    
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Creating automated backup: $BACKUP_FILE"
    
    if mongodump --host "$MONGO_HOST:$MONGO_PORT" --db "$MONGO_DB" --archive="$BACKUP_FILE" --gzip; then
        FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        echo "✅ Backup successfully created ($FILESIZE)."
    else
        echo "❌ ERROR: mongodump command failed!"
    fi
    
    # Prune archives older than retention threshold
    echo "Pruning backups older than $RETENTION_DAYS days..."
    find "$BACKUP_DIR" -type f -name "${MONGO_DB}_*.gz" -mtime +"$RETENTION_DAYS" -exec rm -f {} +
    
    TOTAL_BACKUPS=$(ls -1 "$BACKUP_DIR"/${MONGO_DB}_*.gz 2>/dev/null | wc -l)
    echo "Current total backup archives retained: $TOTAL_BACKUPS"
    
    echo "Sleeping for $BACKUP_INTERVAL seconds until next backup cycle..."
    sleep "$BACKUP_INTERVAL"
done
