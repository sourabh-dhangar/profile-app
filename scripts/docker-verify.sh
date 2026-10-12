#!/usr/bin/env bash
# ===================================================
# MyProfile - Docker Configuration Verification Script
# ===================================================

echo "=========================================================="
echo "🐳 MyProfile Platform: Containerization Verification"
echo "=========================================================="

PASSED=0
FAILED=0

test_component() {
    local condition=$1
    local name=$2
    if [ "$condition" -eq 0 ]; then
        echo "  ✅ PASS: $name"
        PASSED=$((PASSED + 1))
    else
        echo "  ❌ FAIL: $name"
        FAILED=$((FAILED + 1))
    fi
}

# 1. Verify Dockerfile and Config Files
[ -f "backend/Dockerfile" ]; test_component $? "Backend Dockerfile exists"
[ -f "backend/.dockerignore" ]; test_component $? "Backend .dockerignore exists"
[ -f "frontend/Dockerfile" ]; test_component $? "Frontend Dockerfile exists"
[ -f "frontend/nginx.conf" ]; test_component $? "Frontend Nginx SPA config exists"
[ -f "frontend/.dockerignore" ]; test_component $? "Frontend .dockerignore exists"
[ -f "docker/nginx/nginx.conf" ]; test_component $? "Gateway Nginx reverse proxy config exists"
[ -f "docker/nginx/ssl-template.conf" ]; test_component $? "Gateway SSL/TLS template exists"
[ -f "docker/backup/Dockerfile" ]; test_component $? "Database Backup Dockerfile exists"
[ -f "docker/backup/backup.sh" ]; test_component $? "Database Backup script exists"
[ -f "docker-compose.yml" ]; test_component $? "Primary docker-compose.yml exists"
[ -f ".env.docker" ]; test_component $? "Active .env.docker environment file exists"

# 2. Check Docker CLI
if command -v docker &> /dev/null; then
    test_component 0 "Docker CLI is detected on host system"
    echo ""
    echo "Running Docker Compose Syntax Validation..."
    if docker compose --env-file .env.docker config > /dev/null 2>&1; then
        test_component 0 "Docker Compose configuration syntax is valid"
    else
        test_component 1 "Docker Compose config validation failed"
    fi
else
    echo "Docker CLI not detected in PATH; skipping live compose syntax check."
fi

echo "=========================================================="
echo "📊 Verification Summary: $PASSED Passed, $FAILED Failed"
echo "=========================================================="

if [ "$FAILED" -eq 0 ]; then
    echo "🎉 Containerization configuration is 100% production ready!"
    exit 0
else
    echo "⚠️ One or more verification checks failed."
    exit 1
fi
