@echo off
REM IntelliStore Quick Start Script for Windows

echo.
echo ╔════════════════════════════════════════╗
echo ║   IntelliStore Project Setup            ║
echo ╚════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [✓] Node.js found
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not in PATH
    pause
    exit /b 1
)

echo [✓] npm found
npm --version

echo.
echo Checking MongoDB...

REM Check if MongoDB is installed
where mongod >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB not found in PATH
    echo Please ensure MongoDB is installed and running
    echo Download from: https://www.mongodb.com/try/download/community
)

echo.
echo Installing backend dependencies...
cd backend

REM Check if node_modules exists
if not exist node_modules (
    echo Installing npm packages...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install npm packages
        pause
        exit /b 1
    )
) else (
    echo [✓] node_modules already exists
)

REM Check if .env exists
if not exist .env (
    echo Creating .env file from .env.example...
    if exist .env.example (
        copy .env.example .env
        echo [✓] .env created
    ) else (
        echo [ERROR] .env.example not found
    )
) else (
    echo [✓] .env already exists
)

echo.
echo ╔════════════════════════════════════════╗
echo ║   Setup Complete!                       ║
echo ╚════════════════════════════════════════╝
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Run the backend server: npm run dev
echo 3. Open http://localhost:3000 in your browser
echo.
echo For more information, see SETUP_INSTRUCTIONS.md
echo.

pause
