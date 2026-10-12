# ===================================================
# MyProfile - Automated MongoDB Backup Daemon
# ===================================================
FROM alpine:3.19

# Install MongoDB Tools, Bash, Netcat, Gzip, and Timezone data
RUN apk add --no-cache \
    mongodb-tools \
    bash \
    netcat-openbsd \
    gzip \
    tzdata \
    coreutils

WORKDIR /app

COPY backup.sh /app/backup.sh
RUN chmod +x /app/backup.sh

VOLUME ["/backups"]

CMD ["/bin/bash", "/app/backup.sh"]
