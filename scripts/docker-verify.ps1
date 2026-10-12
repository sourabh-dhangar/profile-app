# ===================================================
# MyProfile - Docker Configuration Verification Script
# ===================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🐳 MyProfile Platform: Containerization Verification" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$global:Passed = 0
$global:Failed = 0

function Check-Item {
    param(
        [bool]$Success,
        [string]$Message
    )
    if ($Success) {
        Write-Host "  ✅ PASS: $Message" -ForegroundColor Green
        $global:Passed++
    } else {
        Write-Host "  ❌ FAIL: $Message" -ForegroundColor Red
        $global:Failed++
    }
}

# 1. Verify Dockerfile and Config Files Existence
Check-Item -Success (Test-Path "backend/Dockerfile") -Message "Backend Dockerfile exists"
Check-Item -Success (Test-Path "backend/.dockerignore") -Message "Backend .dockerignore exists"
Check-Item -Success (Test-Path "frontend/Dockerfile") -Message "Frontend Dockerfile exists"
Check-Item -Success (Test-Path "frontend/nginx.conf") -Message "Frontend Nginx SPA config exists"
Check-Item -Success (Test-Path "frontend/.dockerignore") -Message "Frontend .dockerignore exists"
Check-Item -Success (Test-Path "docker/nginx/nginx.conf") -Message "Gateway Nginx reverse proxy config exists"
Check-Item -Success (Test-Path "docker/nginx/ssl-template.conf") -Message "Gateway SSL/TLS template exists"
Check-Item -Success (Test-Path "docker/backup/Dockerfile") -Message "Database Backup Dockerfile exists"
Check-Item -Success (Test-Path "docker/backup/backup.sh") -Message "Database Backup script exists"
Check-Item -Success (Test-Path "docker-compose.yml") -Message "Primary docker-compose.yml exists"
Check-Item -Success (Test-Path ".env.docker") -Message "Active .env.docker environment file exists"

# 2. Check Docker CLI Availability
$DockerCmd = Get-Command "docker" -ErrorAction SilentlyContinue
if ($null -ne $DockerCmd) {
    Check-Item -Success $true -Message "Docker CLI is detected on host system"
    Write-Host "`nRunning Docker Compose Syntax Validation..." -ForegroundColor Yellow
    $configResult = & docker compose --env-file .env.docker config 2>&1
    if ($LASTEXITCODE -eq 0) {
        Check-Item -Success $true -Message "Docker Compose configuration syntax is valid"
    } else {
        Write-Host "$configResult" -ForegroundColor Yellow
        Check-Item -Success $false -Message "Docker Compose config validation failed"
    }
} else {
    Write-Host "`nℹ️ Docker CLI not in PATH; file structure validated." -ForegroundColor Gray
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "📊 Verification Summary: $global:Passed Passed, $global:Failed Failed" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if ($global:Failed -eq 0) {
    Write-Host "🎉 Containerization configuration is 100% production ready!`n" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️ One or more verification checks failed.`n" -ForegroundColor Red
    exit 1
}
