@echo off
REM IntelliStore Project Startup Script for Windows
REM This script starts MongoDB, Backend, and Frontend simultaneously

cls
title IntelliStore - Multi-modal Storage System

echo.
echo ========================================
echo   INTELLISTORE - PROJECT STARTUP
echo ========================================
echo.
echo This script will start:
echo   1. Backend Server (port 5000)
echo   2. Frontend Server (port 3000)
echo.
echo Make sure MongoDB is running!
echo   - Local: mongod
echo   - Cloud: Already configured in backend/.env
echo.

REM Check if we're in the right directory
if not exist "backend\package.json" (
    echo ERROR: backend/package.json not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo Starting IntelliStore...
echo.

REM Check MongoDB connection
echo Checking MongoDB connection...
timeout /t 2 /nobreak

REM Start backend and frontend concurrently
echo Starting Backend (port 5000)...
start cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak

echo Starting Frontend (port 3000)...
start cmd /k "npm run client"

echo.
echo ========================================
echo   STARTUP COMPLETE
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo API Docs: http://localhost:5000/api
echo.
echo The application will open automatically in your browser.
echo You can close this window anytime - servers will keep running.
echo.
pause
