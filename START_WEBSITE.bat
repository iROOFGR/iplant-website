@echo off
setlocal
cd /d "%~dp0"
title iPlant Master Website Preview

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Install the current Node.js LTS version from https://nodejs.org and run this file again.
  pause
  exit /b 1
)

if exist .next (
  echo Clearing the previous website cache...
  rmdir /s /q .next
)

if not exist node_modules\.bin\next.cmd (
  echo Installing website packages. This is required only on the first run...
  if exist node_modules rmdir /s /q node_modules
  call npm install
  if errorlevel 1 (
    echo Package installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

echo.
echo Running content validation...
call npm run validate:content
if errorlevel 1 (
  echo Content validation failed. Review the message above.
  pause
  exit /b 1
)

echo.
echo Starting iPlant at http://localhost:5218/en
echo Keep this window open while reviewing the website.
echo.
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 5; Start-Process 'http://localhost:5218/en'"
call npm run dev
