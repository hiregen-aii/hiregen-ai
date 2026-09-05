@echo off
title HireGen AI - 1-Click Docker Launcher
color 0B
cls
echo ================================================================
echo             HIREGEN AI — 1-CLICK DOCKER LAUNCHER
echo ================================================================
echo.

:: 1. Check if Docker CLI is installed
where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Docker CLI nahi mila!
    echo Kripya Docker Desktop install karein: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

:: 2. Check if Docker daemon is running
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [INFO] Docker Desktop abhi band hai. Use start kiya ja raha hai...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe" 2>nul
    if %ERRORLEVEL% neq 0 (
        start "" "%LOCALAPPDATA%\Programs\Docker\Docker\Docker Desktop.exe" 2>nul
    )
    echo [WAIT] Docker Engine ke initialize hone ka intezar ho raha hai (10-20 seconds)...
    
    :wait_docker
    timeout /t 5 /nobreak >nul
    docker info >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo [...] Docker Engine start ho raha hai, wait karein...
        goto wait_docker
    )
)

echo [OK] Docker Engine running hai!
echo.
echo ================================================================
echo [1/3] Building and starting all microservices...
echo       - PostgreSQL (Database on port 5433)
echo       - Redis (Queue Engine on port 6379)
echo       - Fastify Backend (REST API on port 3000)
echo       - React Frontend (UI on port 8080)
echo       - AI Platform (LLM Gateway on port 3100)
echo       - n8n (10 Workflows on port 5678)
echo       - Prometheus & Grafana (Monitoring on 9090 / 3001)
echo ================================================================
echo.

docker compose -f infra/docker-compose.yml up --build -d

if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [ERROR] Docker Compose start karne me error aaya!
    echo Kripya check karein ki Docker Desktop properly open hai ya nahi.
    pause
    exit /b 1
)

echo.
echo [2/3] Saare containers successfully start ho gaye hain!
echo [3/3] Default browser me HireGen AI khola ja raha hai...
timeout /t 3 /nobreak >nul
start http://localhost:8080

echo.
echo ================================================================
echo                     HIREGEN AI IS LIVE!
echo ================================================================
echo  * Frontend UI:     http://localhost:8080
echo  * Backend API:     http://localhost:3000
echo  * n8n Workflows:   http://localhost:5678
echo  * Grafana Monitor: http://localhost:3001
echo.
echo  Default Login:
echo    Email:    admin@hiregen.ai
echo    Password: Admin@123
echo ================================================================
echo.
echo Band karne ke liye 'stop-docker.bat' par double click karein.
echo.
pause
