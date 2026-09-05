@echo off
title HireGen AI - Stop Docker Containers
color 0E
cls
echo ================================================================
echo             HIREGEN AI — STOP DOCKER CONTAINERS
echo ================================================================
echo.
echo Containers ko safely stop kiya ja raha hai...
docker compose -f infra/docker-compose.yml down
echo.
echo [OK] HireGen AI ke saare containers safely stop ho gaye hain.
echo.
pause
